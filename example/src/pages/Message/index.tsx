import { Outlet, RouterHelper, RouterHelperLink } from '@@/router';

export default function Message() {
  return (
    <div>
      <h1 className="text-24px font-bold mb-24px">message layout</h1>

      <div className="flex flex-col">
        <a onClick={() => RouterHelper.push({ name: 'messageDetail', params: { id: 1 } })}>
          to message 1
        </a>

        <RouterHelperLink to={{ name: 'messageDetail', params: { id: 2 } }}>
          to message 2
        </RouterHelperLink>

        <RouterHelperLink to={{ name: 'messageDetail', params: { id: 3 } }} target="_blank">
          to message 3 new window
        </RouterHelperLink>

        <RouterHelperLink to={{ name: 'messageDetail', params: { id: 4 }, query: { q: 'abc' } }}>
          to message 4 + query
        </RouterHelperLink>

        <RouterHelperLink to={{ name: 'messageDetail', params: { id: 5 }, state: { s: '123' } }}>
          to message 5 + state
        </RouterHelperLink>

        <RouterHelperLink replace to={{ name: 'messageDetail', params: { id: 6 } }}>
          to message 6 + replace
        </RouterHelperLink>
      </div>

      <div className="mt-24px">
        <Outlet />
      </div>
    </div>
  );
}
