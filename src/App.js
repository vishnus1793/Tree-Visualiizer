import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const treeRef = useRef(null);

  const fetchTreeFromUrl = async (e) => {
    if (e) e.preventDefault(); // 👈 prevent form refresh
    setLoading(true);
    setError('');
    setTree(null);

    const input = repoUrl.trim();
    const match = input.match(
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
    );

    if (!match) {
      setError('Invalid GitHub URL format.');
      setLoading(false);
      return;
    }

    const [, owner, repo, branchFromUrl] = match;
    const branch = branchFromUrl || 'main';

    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      );
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

  // 👇 download function (unchanged)
  const downloadTreeAsImage = async () => {
    if (!treeRef.current) return;
    try {
      const canvas = await html2canvas(treeRef.current, {
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = 'repo-tree.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture tree as image:', err);
    }
  };

  const renderTree = (obj) => (
    <ul>
      {Object.entries(obj).map(([key, value]) => (
        <li key={key} className={Object.keys(value).length ? 'folder' : ''}>
          {key}
          {Object.keys(value).length > 0 && renderTree(value)}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          padding: '2.5rem 2rem 2rem 2rem',
          maxWidth: '600px',
          width: '100%',
          marginTop: '2rem',
        }}
      >
        <h2 style={{ color: '#3a3a8c', marginBottom: '0.5rem' }}>
          GitHub Repo Tree Viewer
        </h2>
        <p style={{ color: '#555', marginBottom: '1.5rem' }}>
          Enter GitHub repo URL (e.g.,{' '}
          <code>https://github.com/octocat/Hello-World</code>)
        </p>

        {/* 👇 wrap input + button in a form */}
        <form onSubmit={fetchTreeFromUrl}>
          <input
            type="text"
            placeholder="Enter GitHub repository URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            style={{
              margin: '0.3rem 0',
              padding: '0.7rem',
              width: '100%',
              borderRadius: '0.5rem',
              border: '1.5px solid #a0a0e0',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '1rem',
              background: '#f7f8fc',
            }}
          />
          <br />
          <button
            type="submit" // 👈 important
            style={{
              padding: '0.7rem 1.5rem',
              marginTop: '0.5rem',
              background:
                'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(100,100,200,0.10)',
              transition: 'background 0.2s',
            }}
          >
            Fetch Tree
          </button>
        </form>

        {tree && (
          <button
            onClick={downloadTreeAsImage}
            style={{
              padding: '0.6rem 1.2rem',
              marginTop: '1rem',
              marginLeft: '0.5rem',
              background:
                'linear-gradient(90deg, #34e89e 0%, #0f3443 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(50,150,100,0.10)',
              transition: 'background 0.2s',
            }}
          >
            📥 Download as PNG
          </button>
        )}

        <h3 style={{ color: '#3a3a8c', marginTop: '2rem' }}>Output: </h3>
        {loading && <p style={{ color: '#6a82fb' }}>Loading...</p>}
        {error && (
          <p style={{ color: '#fc5c7d', fontWeight: 'bold' }}>{error}</p>
        )}
        {tree && (
          <div
            ref={treeRef}
            style={{
              marginTop: '1.5rem',
              background: '#f7f8fc',
              borderRadius: '1rem',
              padding: '1.2rem',
              boxShadow: '0 2px 8px rgba(100,100,200,0.07)',
              overflowX: 'auto',
            }}
          >
            {renderTree(tree)}
          </div>
        )}
        <style>{`
          ul {
            list-style-type: none;
            padding-left: 1.5rem;
          }
          li {
            font-size: 1.05rem;
            color: #444;
            margin-bottom: 0.2rem;
            position: relative;
            padding-left: 0.3rem;
            transition: background 0.2s;
          }
          li.folder {
            color: #3a3a8c;
            font-weight: 600;
          }
          li.folder::before {
            content: "📁 ";
            color: #fbb034;
            font-size: 1.1em;
          }
          li:not(.folder)::before {
            content: "📄 ";
            color: #6a82fb;
            font-size: 1.1em;
          }
          li:hover {
            background: #e3e8ff;
            border-radius: 0.3rem;
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;
