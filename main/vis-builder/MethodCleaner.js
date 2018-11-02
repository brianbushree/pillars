exports.cleanMethodSignatures = 
function cleanMethodSignatures(method) {
  method.signature = cleanMethodSig(method.signature);
  method.calls.forEach(function(call) {
    cleanMethodSignatures(call);
  });
  method.instructions
  .filter(function(instr) { return instr.type == "METHOD_CALL"; })
  .forEach(function(instr) {
    instr.callSignature = cleanMethodSig(instr.callSignature);
  });
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function parseNextType(str, index) {

  let c = str.charAt(index);
  let type;

  // parse types
  switch (c) {
    case 'B':
      type = 'byte'; break;
    case 'C':
      type = 'char'; break;
    case 'D':
      type = 'double'; break;
    case 'F':
      type = 'float'; break;
    case 'I':
      type = 'int'; break;
    case 'J':
      type = 'long'; break;
    case 'S':
      type = 'short'; break;
    case 'Z':
      type = 'boolean'; break;
    default:

      if (c == 'L') {

        // parse reference
        let s = index;
        while (str.charAt(s) != ';') {
          s++;
        }
        type = str.substring(index + 1, s);
        index = s;
        type = replaceAll(type, '/', '.');

      } else if (c == '[') {

        // parse array dimension
        nextTypeArr = parseNextType(str, index + 1);
        type = nextTypeArr[0] + '[]';
        index = nextTypeArr[1];

      } else {
        // error
      }
      break;
  }

  return [type, index];
}

function cleanMethodSig(sig) {

  // replace slashes with periods
  let name = sig.substring(0, sig.indexOf('('));
  name = replaceAll(name, '/', '.');

  // parse params
  let paramStr = sig.substring(sig.indexOf('(') + 1, sig.indexOf(')'));
  let params = []
  for (let i = 0; i < paramStr.length; i++) {
    let nextTypeArr = parseNextType(paramStr, i);
    params.push(nextTypeArr[0]);
    i = nextTypeArr[1];
  }

  // parse return type
  let returnType;
  let returnStr = sig.substring(sig.indexOf(')') + 1, sig.length);
  if (returnStr == 'V') {
    returnType = 'void';
  } else {
    returnType = parseNextType(returnStr, 0)[0];
  }

  sig = name + '(' + params.join(', ') + ')';
  return sig;
}
