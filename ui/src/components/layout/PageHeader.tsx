import { Link } from "react-router";
import logo from "../../assets/logo.svg";
import Breadcrumbs from "./Breadcrumbs";

function PageHeader() {
  return (
    <div className="flex flex-col mb-4">
      <div className="flex flex-row text-center h-20 gap-5 items-center mb-2">
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
      <Breadcrumbs />
    </div>
  );
}
export default PageHeader;
