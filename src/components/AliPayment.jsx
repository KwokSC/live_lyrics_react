export default function AliPayment({currentPage, money}){
    <div
    className="tip-container"
    style={{ display: currentPage === "ALIPAY" ? "" : "none" }}
  >
    <p>Redirect to Alipay...</p>
    <i className="fi fi-rr-loading" style={{ fontSize: "30px" }}></i>
  </div>
}