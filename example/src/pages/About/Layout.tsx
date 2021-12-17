import { Outlet } from '@@/router';

export default function Layout() {
  return (
    <div>
      <h1 className="text-24px font-bold mb-24px">About Header</h1>

      <div className="mt-24px">
        <Outlet />
      </div>
    </div>
  );
}
