'use strict';

const { sep, resolve } = require('path');
const fs = require('fs');
// add suffix (".html" or sep for windows test) to each part of regex
// to ignore possible occurrences in titles (e.g. blog posts)
const isEditable = `(security|index).html|(about|download|docs|foundation|get-involved|knowledge)\\${sep}`;
const isEditableReg = new RegExp(isEditable);

// This middleware adds "Edit on GitHub" links to every editable page
function githubLinks(options) {
  return (files, m, next) => {
    Object.keys(files).forEach((path) => {
      if (!isEditableReg.test(path)) {
        return;
      }

      const file = files[path];
      path = path.replace('.html', '.md').replace(/\\/g, '/');

      const currentFilePath = resolve(
        __dirname,
        `../../locale/${options.locale}/${path}`
      );

      if (!fs.existsSync(currentFilePath)) {
        path = path.replace('/index.md', '.md');
      }

      const url = `https://github.com/nodejs/nodejs.org/edit/main/locale/${options.locale}/${path}`;
      const editOnGitHubTrans = options.site.editOnGithub || 'Edit on GitHub';
      const replCallBack = (match, $1, $2) => {
        return `<div class="openjsfoundation-footer-edit">
             | <a href="${url}">${editOnGitHubTrans}</a>
             </div>`;
      };
      const contents = file.contents
        .toString()
        .replace(
          /<div class="openjsfoundation-footer-edit"><\/div>/,
          replCallBack
        );

      file.contents = Buffer.from(contents);
    });

    next();
  };
}

module.exports = githubLinks;
