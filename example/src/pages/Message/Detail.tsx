import { useParams, useSearchParams, useLocation } from '@@/router';

export default function MessageDetail() {
  const { id } = useParams();
  const [query] = useSearchParams();
  const location = useLocation();

  return (
    <div>
      message {id}
      {query.get('q') && <p className="mt-24px">query q: {query.get('q')}</p>}
      {location.state?.s && <p className="mt-24px">state s: {location.state.s}</p>}
    </div>
  );
}
