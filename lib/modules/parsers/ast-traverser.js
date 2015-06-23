function tree(node, visitor) {
  if (typeof node !== 'object') {
    return node;
  }
  //console.log('Accessing node', visitor)
  if (visitor && visitor.test && visitor.test(node.type, node)) {
    node = visitor.process(node);
    if (!node) {
      return;
    }
  }
  var res = [node.type];
  //console.log("-- child length", node.content.length)
  if (node.content) {
    for (var i = 0; i <= node.content.length; i++) {
      var n = tree(node.content[i], visitor);
      if (n) {
        res.push(n);
      }
    }
  }
  return res;
}

module.exports = {
  traverse: function traverse(ast, visitor) {
    return tree(ast, visitor);
  }
};
