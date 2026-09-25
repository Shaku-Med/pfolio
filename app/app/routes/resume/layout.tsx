import { Outlet } from "react-router";

const ResumeLayout = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-24 sm:px-5 md:px-6">
      <Outlet />
    </main>
  );
};

export default ResumeLayout;

