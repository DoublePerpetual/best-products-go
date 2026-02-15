import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [categories, setCategories] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ l1: 0, l2: 0, l3: 0 });

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        
        // 计算统计
        let l1Count = 0, l2Count = 0, l3Count = 0;
        Object.keys(data).forEach(l1 => {
          l1Count++;
          Object.keys(data[l1] || {}).forEach(l2 => {
            l2Count++;
            l3Count += (data[l1][l2] || []).length;
          });
        });
        setStats({ l1: l1Count, l2: l2Count, l3: l3Count });
      });
  }, []);

  return (
    <div className="container">
      <Head>
        <title>全球商品品类库</title>
        <meta name="description" content="扩展后的全球商品品类数据" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </Head>

      <main>
        <h1><i className="fas fa-globe"></i> 全球商品品类库</h1>
        
        {stats.l3 > 0 && (
          <div className="stats">
            <div className="stat-card">
              <span className="stat-number">{stats.l1}</span>
              <span className="stat-label">一级类目</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.l2.toLocaleString()}</span>
              <span className="stat-label">二级类目</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.l3.toLocaleString()}</span>
              <span className="stat-label">三级品类</span>
            </div>
          </div>
        )}

        <div className="search-box">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="搜索品类..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {categories && <CategoryTree data={categories} searchTerm={searchTerm} />}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        main {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 2rem;
          font-size: 2.5rem;
        }
        h1 i {
          color: #667eea;
          margin-right: 1rem;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 10px;
          text-align: center;
        }
        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
        }
        .stat-label {
          font-size: 1rem;
          opacity: 0.9;
        }
        .search-box {
          position: relative;
          margin-bottom: 2rem;
        }
        .search-box input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s;
        }
        .search-box input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }
      `}</style>
    </div>
  );
}

function CategoryTree({ data, searchTerm }) {
  const [expanded, setExpanded] = useState({});

  const filterCategories = (items) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="category-tree">
      {Object.entries(data).map(([l1, l2s]) => (
        <div key={l1} className="l1-category">
          <div className="l1-header" onClick={() => setExpanded({...expanded, [l1]: !expanded[l1]})}>
            <i className={`fas fa-chevron-${expanded[l1] ? 'down' : 'right'}`}></i>
            <span className="l1-name">{l1}</span>
            <span className="l1-count">{Object.keys(l2s).length}个二级</span>
          </div>
          
          {expanded[l1] && (
            <div className="l2-container">
              {Object.entries(l2s).map(([l2, l3s]) => {
                const filtered = filterCategories(l3s);
                if (searchTerm && filtered.length === 0) return null;
                
                return (
                  <div key={l2} className="l2-category">
                    <div className="l2-name">{l2}</div>
                    <div className="l3-list">
                      {filtered.map((l3, i) => (
                        <span key={i} className="l3-item">{l3}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        .l1-category {
          margin-bottom: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }
        .l1-header {
          padding: 1rem;
          background: #f8f9fa;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background 0.3s;
        }
        .l1-header:hover {
          background: #e9ecef;
        }
        .l1-header i {
          margin-right: 1rem;
          color: #667eea;
          width: 1rem;
        }
        .l1-name {
          flex: 1;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .l1-count {
          color: #666;
          font-size: 0.9rem;
          background: #e9ecef;
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
        }
        .l2-container {
          padding: 1rem;
          background: white;
        }
        .l2-category {
          margin-bottom: 1.5rem;
        }
        .l2-name {
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e9ecef;
        }
        .l3-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .l3-item {
          padding: 0.3rem 0.8rem;
          background: #f1f3f5;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #495057;
          transition: all 0.2s;
        }
        .l3-item:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
