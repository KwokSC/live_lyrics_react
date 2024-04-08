export default function Overlay({isCovered, onClick}) {
  return (
    <div
      className="overlay"
      style={{ display: isCovered ? "" : "none" }}
      onClick={onClick}
    />
  );
}
