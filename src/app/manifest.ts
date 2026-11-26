import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAINTS 2027',
    short_name: 'SAINTS 2027',
    description: 'International Conference on Scientific Advances in Natural and Technological Sciences',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#0b1a3a',
  };
}
