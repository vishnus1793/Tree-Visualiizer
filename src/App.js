import React, { useState } from 'react';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTreeFromUrl = async () => {
    setLoading(true);
    setError('');
    setTree(null);

    const input = repoUrl.trim();
    const match = input.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/);

    if (!match) {
      setError('Invalid GitHub URL format.');
      setLoading(false);
      return;
    }

    const [, owner, repo, branchFromUrl] = match;
    const branch = branchFromUrl || 'main';

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
      const data = await res.json();

      if (!data.tree) {
        setError('Could not fetch repo contents. Check the URL and branch.');
        setLoading(false);
        return;
      }

      const root = {};
      for (const item of data.tree) {
        const parts = item.path.split('/');
        let current = root;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }

      setTree(root);
    } catch (err) {
      setError('Error fetching data.');
      console.error(err);
    }

    setLoading(false);
  };

  const renderTree = (obj) => {
    return (
      <ul>
        {Object.entries(obj).map(([key, value]) => (
          <li key={key} className={Object.keys(value).length ? 'folder' : ''}>
            {key}
            {Object.keys(value).length > 0 && renderTree(value)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '1rem' }}>
      <h2>GitHub Repo Tree Viewer</h2>
      <p>
        Enter GitHub repo URL (e.g., <code>https://github.com/octocat/Hello-World</code>)
      </p>
      <input
        type="text"
        placeholder="Enter GitHub repository URL..."
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{ margin: '0.3rem 0', padding: '0.4rem', width: '50%' }}
      />
      <br />
      <button onClick={fetchTreeFromUrl} style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
        Fetch Tree
      </button>

      <h3>Output: </h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tree && <div>{renderTree(tree)}</div>}

      <style>{`
        ul {
          list-style-type: none;
          padding-left: 1.5rem;
        }
        li::before {
          content: "📄 ";
        }
        li.folder::before {
          content: "📁 ";
        }
      `}</style>
    </div>
  );
}

export default App;
