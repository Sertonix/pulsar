const fs = require('fs-plus');
const path = require('path');
const season = require('season');
const temp = require('temp').track();
const runAtom = require('./helpers/start-atom');

describe('Smoke Test', () => {
  // Fails on win32
  if (process.platform !== 'darwin') {
    return;
  }

  const atomHome = temp.mkdirSync('atom-home');

  beforeEach(() => {
    jasmine.useRealClock();
    season.writeFileSync(path.join(atomHome, 'config.cson'), {
      '*': {
        welcome: { showOnStartup: false },
        core: {
          disabledPackages: ['github']
        }
      }
    });
  });

  /**
  * TODO: FAILING TEST - This test fails with the following output: (macos only)
  * timeout: timed out after 15000 msec waiting for webdriver to start 
  */
  xit('can open a file in Atom and perform basic operations on it', async () => {
    const tempDirPath = temp.mkdirSync('empty-dir');
    const filePath = path.join(tempDirPath, 'new-file');

    fs.writeFileSync(filePath, '', { encoding: 'utf8' });

    runAtom([tempDirPath], { ATOM_HOME: atomHome }, async client => {
      const roots = await client.treeViewRootDirectories();
      expect(roots).toEqual([tempDirPath]);

      await client.execute(filePath => core.workspace.open(filePath), filePath);

      const textEditorElement = await client.$('atom-text-editor');
      await textEditorElement.waitForExist(5000);

      await client.waitForPaneItemCount(1, 1000);

      await textEditorElement.click();

      const closestElement = await client.execute(() =>
        document.activeElement.closest('atom-text-editor')
      );
      expect(closestElement).not.toBeNull();

      await client.keys('Hello!');

      const text = await client.execute(() =>
        core.workspace.getActiveTextEditor().getText()
      );
      expect(text).toBe('Hello!');

      await client.dispatchCommand('editor:delete-line');
    });
  });
});
