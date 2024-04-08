export default function NavBar({ navState, navItemList }) {
  return (
    <div className={`nav-bar ${navState ? "active" : "hidden"}`}>
      {navItemList.map((navItem, index) => (
        <button key={index} className="nav-item" onClick={navItem.onClick}>{navItem.text}</button>
      ))}
    </div>
  );
}