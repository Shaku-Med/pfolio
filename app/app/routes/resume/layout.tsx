import { Outlet } from "react-router";

const ResumeLayout = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-2 sm:py-5 md:py-6 ">
      <Outlet />
    </main>
  );
};

export default ResumeLayout;

