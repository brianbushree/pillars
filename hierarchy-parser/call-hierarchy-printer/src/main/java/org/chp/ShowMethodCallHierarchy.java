package org.chp;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;
import org.kohsuke.args4j.Option;
import org.kohsuke.args4j.OptionHandlerFilter;
import org.kohsuke.args4j.spi.StringArrayOptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spoon.Launcher;
import spoon.compiler.ModelBuildingException;
import spoon.reflect.reference.CtExecutableReference;
import spoon.reflect.reference.CtTypeReference;
import spoon.support.QueueProcessingManager;
import spoon.support.compiler.FileSystemFolder;

import java.util.Collections;
import java.io.File;
import java.io.PrintStream;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;

public class ShowMethodCallHierarchy {
    private static Logger logger = LoggerFactory.getLogger(ShowMethodCallHierarchy.class);

    @Option(name="-s", aliases = "--source-folder", metaVar = "SOURCE_FOLDERS",
            usage="source folder(s) for the analyzed project",
            handler = StringArrayOptionHandler.class,
            required = true)
    private List<String> sourceFolders;

    @Option(name="-m", aliases = "--method-name", metaVar = "METHOD_NAME",
            usage="method name to print call hierarchy",
            required = true)
    private String methodName;

    @Option(name="-c", aliases = "--classpath",  metaVar = "CLASSPATH",
            usage="classpath for the analyzed project")
    private String classpath;

    @Option(name="--classpath-file", metaVar = "CLASSPATH_FILE", usage="file containing the classpath for the analyzed project",
            forbids = "--classpath")
    private File classpathFile;
    private PrintStream printStream;

    public static void main(String[] args) throws Exception {
        List<String[]> margs = runMultiple(args);
        for (String[] a : margs) {
            ShowMethodCallHierarchy.parse(a).doMain();
        }
    }

    private static List<String[]> runMultiple(String[] args) {
        List<String> methods = new ArrayList<String>();
        List<String[]> margs = new ArrayList<String[]>();
        int m = -1;
        int i;
        int j;
        for (i = 0; i < args.length; i++) {
            if (args[i].equals("-M") && i + 1 < args.length) {
                Collections.addAll(methods, args[i + 1].split(" "));
                m = i;
                break;
            }
        }

        if (m == -1) {

            margs.add(args);

        } else {

            for (j = 0; j < methods.size(); j++) {
                margs.add(new String[args.length]);
                for (i = 0; i < args.length; i++) {
                    if (i == m) {
                        margs.get(j)[i] = "-m";
                    } else if (i == m + 1) {
                        margs.get(j)[i] = methods.get(j);
                    } else {
                        margs.get(j)[i] = args[i];
                    }
                }
            }

        }

        return margs;
    }

    private static ShowMethodCallHierarchy parse(String[] args) {
        ShowMethodCallHierarchy showMethodCallHierarchy = new ShowMethodCallHierarchy(System.out);
        CmdLineParser parser = new CmdLineParser(showMethodCallHierarchy);
        try {
            parser.parseArgument(args);
        } catch (CmdLineException e) {
            System.err.println(e.getMessage());
            System.err.print("Usage: java -jar <CHP_JAR_PATH>" + parser.printExample(OptionHandlerFilter.REQUIRED));
            System.err.println();
            System.err.println();
            System.err.println("Options:");
            parser.printUsage(System.err);
            System.exit(1);
        }
        return showMethodCallHierarchy;
    }

    public ShowMethodCallHierarchy(PrintStream printStream) {
        this.printStream = printStream;
    }

    public ShowMethodCallHierarchy(String classpath, List<String> sourceFolders, String methodName, PrintStream printStream) {
        this(printStream);
        this.sourceFolders = sourceFolders;
        this.methodName = methodName;
        this.classpath = classpath;
    }

    public void doMain() throws Exception {
        Launcher launcher = new Launcher();
        if (classpath != null) {
            launcher.setArgs(new String[] { "--source-classpath", classpath});
        }
        if (classpathFile != null) {
            launcher.setArgs(new String[] { "--source-classpath", StringUtils.strip(FileUtils.readFileToString(classpathFile), "\n\r\t ")});
        }
        sourceFolders = applySrcFix(sourceFolders);
        for (String sourceFolder : sourceFolders) {
            launcher.addInputResource(new FileSystemFolder(new File(sourceFolder)));
        }
        try {
            launcher.run();
        } catch (ModelBuildingException e) {
            throw new RuntimeException("You most likely have not specified your classpath. Pass it in using either '--claspath' or '--classpath-file'.", e);
        }

        printCallHierarchy(launcher, printStream);
    }

    private List<String> applySrcFix(List<String> sourceFolders) {
        ArrayList<String> newSrc = new ArrayList<String>();
        String last = "";

        for (String sourceFolder : sourceFolders) {
            if (sourceFolder.endsWith("\\")) {
                last += sourceFolder.substring(0, sourceFolder.length() - 1) + " ";
            } else {
                last += sourceFolder;
                newSrc.add(last);
                last = "";
            }
        }
        
        return newSrc;
    }

    private void printCallHierarchy(Launcher launcher, PrintStream printStream) throws Exception {
        QueueProcessingManager queueProcessingManager = new QueueProcessingManager(launcher.getFactory());
        Map<CtTypeReference, Set<CtTypeReference>> classHierarchy =
                new ClassHierarchyProcessor().executeSpoon(queueProcessingManager);
        Map<CtExecutableReference, List<CtExecutableReference>> callList =
                new MethodExecutionProcessor().executeSpoon(queueProcessingManager);

        List<MethodCallHierarchyBuilder> methodCallHierarchyBuilders = MethodCallHierarchyBuilder.forMethodName(methodName, callList, classHierarchy);
        if (methodCallHierarchyBuilders.isEmpty()) {
            printStream.println("No method containing `" + methodName + "` found.");
        }
        if (methodCallHierarchyBuilders.size() > 1) {
            printStream.println("Found " + methodCallHierarchyBuilders.size() + " matching methods...");
            printStream.println();
        }
        for (MethodCallHierarchyBuilder each : methodCallHierarchyBuilders) {
            each.printCallHierarchy(printStream);
            printStream.println();
        }
    }
}
