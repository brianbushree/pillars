const {ipcRenderer} = require('electron');
const nsh = require('node-syntaxhighlighter');
const urlParams = new URLSearchParams(window.location.search);

const nodeId = urlParams.get('id');
let visData = null;
let wholeTree = null;
let subtree = null;
let nodeIdMap = null;

const Types = {
  WRITE: 'WRITE',
  READ: 'READ',
  METHOD_CALL: 'METHOD_CALL'
};

const WRITE = 'WRITE';
const READ = 'READ';
const METHOD_CALL = 'METHOD_CALL';

// request data from main process
ipcRenderer.send('data-req');
ipcRenderer.on('data-res', function (event, data) {
  setup(data);
  console.log(nodeIdMap);
  render();
});

function backToTree() {
  ipcRenderer.send('load-tree');
}



function setup(data) {
  console.log(data);
  visData = data;

  // nodeListSubTree = data.data.filter(function(call){
  //   return call.id == nodeId || call.id.startsWith(nodeId + '.');
  // });

  // console.log(nodeListSubTree);
  const stratify = d3.stratify()
    .id(function(d) { return d.id; })
    .parentId(function(d) {
      return d.id.substring(0, d.id.lastIndexOf('.'));
    });

  wholeTree = stratify(data.data);
  wholeTree.each(function(n) {
    if (n.id == nodeId) {
      subtree = n;
    }
  });

  nodeIdMap = {};
  subtree.each(function(n) {
    nodeIdMap[n.id] = n;
  });
}

function updateCodeView(root) {
  let label = document.getElementById('code-label');
  let block = document.getElementById('code-block');
  let cls = visData.class_map[visData.mthd_map[root.data.sig].parent];

  block.innerHTML = nsh.highlight(cls.src_content, nsh.getLanguage('java'));
  label.innerText = cls.src.substring(cls.src.lastIndexOf('/')+1, cls.src.length);

  let sidebar = document.getElementById('sidebar');
  let instructions = document.getElementById('instructions');

  // make code-block fill page
  let h = Math.max((document.body.offsetHeight - sidebar.offsetTop + 40), 
                   (window.innerHeight - sidebar.offsetTop - 8));
  sidebar.setAttribute('style', 'height:' + h + 'px;')
}

function highlightLineNumber(lineNum, instr) {
  unhighlightLines();

  let cont = document.getElementById('code-block');
  let line = d3.selectAll('div.line.number' + lineNum);
  if (!line) {
    console.log('Line out of bounds!')
  } else {
    line.classed('highlighted', true);
    cont.parentNode.scrollTop = line.node().offsetTop - instr.offsetTop + 20;
  }
}

function unhighlightLines() {
  let line = d3.selectAll('#sidebar div.line');
  line.classed('highlighted', false);
}

function render() {

  addMethod(d3.select('#method'), subtree);
  addInstructions(d3.select('#instructions'), subtree);
  updateCodeView(subtree);

}

function addMethod(container, subtree) {

  let crumbsCont = container
    .append('div')
    .classed('breadcrumbs', true);

  let parents = [];
  let n = subtree;
  while (n.parent != null) {
    parents.unshift(n.parent);
    n = n.parent;
  }

  let crumbs = crumbsCont
    .selectAll('crumb')
    .data(parents);

  let enterCrumb = crumbs.enter()
    .append('span')
    .classed('crumb', true);

  enterCrumb
    .append('a')
    .attr('href', '#')
    .text(function(d) {
      return d.data.sig;
    })
    .on('click', function(d) {
      ipcRenderer.send('node-select', d.data.id);
      return false;
    })

  enterCrumb
    .append('span')
    .text(' > ');

  container
    .append('h2')
    .text(subtree.data.sig);

  container
    .append('p')
    .classed('params', true)
    .text('parameters: '
      + subtree.data.params.join(' '));

  container
    .append('p')
    .classed('return-value', true)
    .text('return value: '
    + subtree.data.returnValue);
}

function addInstructions(container, subtree) {

  let all = container
    .selectAll('instruction')
    .data(subtree.data.instructions);

  // update
  //   all...

  let enter = all.enter()
    .append('tr')
    .attr('class', function(d) {
      if (d.type == Types.READ) {
        return 'read';
      } else if (d.type == Types.WRITE) {
        return 'write';
      } else if (d.type == Types.METHOD_CALL) {
        return 'method-call';
      }
    })
    .classed('instuction', true)
    .on('mouseover', function(d) {
      highlightLineNumber(d.linenum, d3.select(this).node());
    });

  // add linenum
  enter
    .append('td')
    .classed('linenum', true)
    .text(function(d) {
      return d.linenum;
    });

  let enterRWs = enter.filter(function(d){
    return d.type == Types.READ ||  d.type == Types.WRITE
  });

  let enterCalls = enter.filter(function(d,i){
    return d.type == Types.METHOD_CALL;
  });

  // add types
  enterRWs
    .append('td')
    .classed('type', true)
    .text(function(d) {
      if (d.type == Types.READ) {
        return 'read'
      } else {
        return 'write'
      }
    });
  enterCalls
    .append('td')
    .classed('type', true)
    .text('method call');  

  // add variable
  enterRWs
    .append('td')
    .classed('variable', true)
    .text(function(d) {
      return d.variable.type + ' '
            + d.variable.name;
    });

  // add value
  enterRWs
    .append('td')
    .classed('value', true)
    .text(function(d) {
      return d.value;
    })

  // add call sig
  enterCalls
  .append('td');
  enterCalls
    .append('td')
    .classed('signature', true)
    .text(function(d) {
      return d.callSignature;
    });
}