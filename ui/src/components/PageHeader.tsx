import { Link } from "react-router";
import logo from "../assets/logo.svg";

function PageHeader() {
  return (
    <div className="flex flex-row text-center h-20 mb-10 gap-5 items-center">
      <Link to="/">
        <img src={logo} alt="Logo Eveil Spirituel" className="block h-full" />
      </Link>
      <h1 className="">
        <a href="#">
          {/* href = @hasSection('page-title')@yield('page-title-link')@else{{ route('events.index') }}@endif */}
          Covoiturage Éveil Spirituel
          {/* @hasSection('page-title') - @yield('page-title') @endif */}
        </a>
      </h1>
    </div>
  );
}
export default PageHeader;
