import Link from "next/link";
import AdminPathSettings from "../AdminPathSettings";
import ChangePassword from "@/app/account/password/ChangePassword";

export default function SecurityPage(){
  return (
    <section className="panel-content">
      <div className="panel-title">
        <div>
          <span className="eyebrow">HIMOYA</span>
          <h1>Xavfsizlik</h1>
          <p>Administrator manzili va parolini shu yerda boshqaring.</p>
        </div>
      </div>
      <div className="panel-grid">
        <section className="panel-card"><AdminPathSettings/></section>
        <section className="panel-card"><ChangePassword/></section>
      </div>
      <section className="panel-card security-danger-entry">
        <div className="panel-card-head">
          <div>
            <strong>Xavfli hudud</strong>
            <small>Admin huquqlari va ommaviy o‘chirish amallari.</small>
          </div>
          <Link className="danger-outline-button" href="./security/danger">Xavfli hududni ochish</Link>
        </div>
      </section>
    </section>
  );
}
