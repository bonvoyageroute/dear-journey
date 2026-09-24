export default function Header({ kicker, title, right }) {
  return (
    <div className="hd">
      <div className="k">
        <span className="lbl">{kicker}</span>
        {right ? <span className="lbl">{right}</span> : null}
      </div>
      <h1>{title}</h1>
      <div className="rule" />
    </div>
  );
}
