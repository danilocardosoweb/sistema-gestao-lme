/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Configuração de rewrites para desenvolvimento e produção
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction 
      ? process.env.API_URL || 'https://sua-api-publica.vercel.app'  // URL da API em produção (ajuste para sua URL real)
      : 'http://localhost:3000';  // URL da API em desenvolvimento
      
    console.log(`Ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'}, API URL: ${apiUrl}`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      }
    ];
  }
};

module.exports = nextConfig;
