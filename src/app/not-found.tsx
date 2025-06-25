export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>404 - ページが見つかりません</h1>
        <p style={{ color: '#aaa' }}>お探しのページは存在しません。</p>
      </div>
    </div>
  );
} 