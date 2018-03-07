var replaceInner = (node, str, replace, tagName = 'span') => {
  const tags = node.getElementsByTagName(tagName) || [];
  for (const tag of tags) {
    const tagContent = tag.textContent;
    if (tagContent.trim().includes(str)) {
      tag.innerHTML = replace(tagContent);
      return;
    }
  }
};

var renders = [
  [
    // for specific files
    /\/((\w|\.)+)$/,
    {
      'package.json': (line, node) => {
        const [, name, ver] = line.match(/"(.+)":\s*"(.+)"/) || [];
        const semverRegex = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/ig;
        if (!semverRegex.test(ver)) {
          return;
        }
        replaceInner(node, name, content => `<a href=https://www.npmjs.com/package/${name}>${content}</a>`);
      }
    }
  ],
  [
    // for specific exntensions
    /\.(\w+)$/,
    {
      'h hh hpp c cc cpp': (line, node) => {
        const [, file] = line.match(/#include\s+"(.+)"/) || [];
        if (!file) {
          return;
        }
        replaceInner(node, file, content => `<a href=${content}>${content}</a>`);
      },
      'js': (line, node) => {
        // TODO: require, import, export
      },
      'py': (line, node) => {
      }
    }
  ]
].map(([v1, v2]) => [
  v1, Object.entries(v2).reduce((obj, [ks, v]) => ks.split(' ').reduce((kobj, k) => ({ ...kobj, [k]: v }), obj), {})
]);

var renderGeneric = (line, node) => {
  const strs = line.match(/[^"]+(?=(" ")|")/g) || [];
  const urlRegex = /\w+\:\/\//;
  for (const elem of strs) {
    if (!urlRegex.test(elem)) {
      continue;
    }
    replaceInner(node, elem, (content) => `<a href=${content}>${content}</a>`);
  }
};

var main = () => {
  const url = document.URL.split('#')[0];

  for (const [groupPattern, groupFiles] of renders) {
    const [, str] = url.match(groupPattern) || [];
    if (typeof groupFiles[str] === 'function') {
      const renderFile = groupFiles[str];
      $('.file tbody > tr').each((index, node) => {
        const line = node.textContent.trim();
        renderFile(line, node)
        renderGeneric(line, node);
      });
      break;
    }
  }
}

main();
