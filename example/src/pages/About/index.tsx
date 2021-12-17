import { RouterHelperLink as Link, useSearchParams } from '@@/router';

export default function About() {
  const [query] = useSearchParams()

  return (
    <div className='flex flex-col'>
      <span>About {query.get('name') || 'all'} Index Page.</span>

      <Link to="/about/detail" className='mt-24px' target="_blank">to about detail</Link>
    </div>
  );
}
