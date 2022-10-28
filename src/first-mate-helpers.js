module.exports = {
  fromFirstMateScopeId(firstMateScopeId) {
    let editorScopeId = -firstMateScopeId;
    if ((editorScopeId & 1) === 0) editorScopeId--;
    return editorScopeId + 256;
  },

  toFirstMateScopeId(editorScopeId) {
    return -(editorScopeId - 256);
  }
};
