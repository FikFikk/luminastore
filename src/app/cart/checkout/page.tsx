"use client"; // kalau di Next.js 13+ pakai app router

import React from "react";

function CheckoutPage() {
  return (
    <>
      {/* Start Hero Section */}
      <div className="hero">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-5">
              <div className="intro-excerpt">
                <h1>Checkout</h1>
              </div>
            </div>
            <div className="col-lg-7"></div>
          </div>
        </div>
      </div>
      {/* End Hero Section */}

      <div className="untree_co-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-12">
              <div className="border p-4 rounded" role="alert">
                Returning customer? <a href="#">Click here</a> to login
              </div>
            </div>
          </div>
          <div className="row">
            {/* Billing Details */}
            <div className="col-md-6 mb-5 mb-md-0">
              <h2 className="h3 mb-3 text-black">Billing Details</h2>
              <div className="p-3 p-lg-5 border bg-white">
                <div className="form-group">
                  <label htmlFor="c_country" className="text-black">
                    Country <span className="text-danger">*</span>
                  </label>
                  <select id="c_country" className="form-control">
                    <option value="1">Select a country</option>
                    <option value="2">Bangladesh</option>
                    <option value="3">Algeria</option>
                    <option value="4">Afghanistan</option>
                    <option value="5">Ghana</option>
                    <option value="6">Albania</option>
                    <option value="7">Bahrain</option>
                    <option value="8">Colombia</option>
                    <option value="9">Dominican Republic</option>
                  </select>
                </div>

                <div className="form-group row">
                  <div className="col-md-6">
                    <label htmlFor="c_fname" className="text-black">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" id="c_fname" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="c_lname" className="text-black">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" id="c_lname" />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-md-12">
                    <label htmlFor="c_companyname" className="text-black">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_companyname"
                    />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-md-12">
                    <label htmlFor="c_address" className="text-black">
                      Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_address"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="form-group mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Apartment, suite, unit etc. (optional)"
                  />
                </div>

                <div className="form-group row">
                  <div className="col-md-6">
                    <label htmlFor="c_state_country" className="text-black">
                      State / Country <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_state_country"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="c_postal_zip" className="text-black">
                      Postal / Zip <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_postal_zip"
                    />
                  </div>
                </div>

                <div className="form-group row mb-5">
                  <div className="col-md-6">
                    <label htmlFor="c_email_address" className="text-black">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="c_email_address"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="c_phone" className="text-black">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_phone"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                {/* Order Notes */}
                <div className="form-group">
                  <label htmlFor="c_order_notes" className="text-black">
                    Order Notes
                  </label>
                  <textarea
                    name="c_order_notes"
                    id="c_order_notes"
                    // cols="30"
                    // rows="5"
                    className="form-control"
                    placeholder="Write your notes here..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Order Section */}
            <div className="col-md-6">
              <div className="row mb-5">
                <div className="col-md-12">
                  <h2 className="h3 mb-3 text-black">Coupon Code</h2>
                  <div className="p-3 p-lg-5 border bg-white">
                    <label
                      htmlFor="c_code"
                      className="text-black mb-3"
                    >
                      Enter your coupon code if you have one
                    </label>
                    <div className="input-group w-75 couponcode-wrap">
                      <input
                        type="text"
                        className="form-control me-2"
                        id="c_code"
                        placeholder="Coupon Code"
                      />
                      <div className="input-group-append">
                        <button className="btn btn-black btn-sm" type="button">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Table */}
              <div className="row mb-5">
                <div className="col-md-12">
                  <h2 className="h3 mb-3 text-black">Your Order</h2>
                  <div className="p-3 p-lg-5 border bg-white">
                    <table className="table site-block-order-table mb-5">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            Top Up T-Shirt <strong className="mx-2">x</strong> 1
                          </td>
                          <td>$250.00</td>
                        </tr>
                        <tr>
                          <td>
                            Polo Shirt <strong className="mx-2">x</strong> 1
                          </td>
                          <td>$100.00</td>
                        </tr>
                        <tr>
                          <td className="text-black font-weight-bold">
                            <strong>Cart Subtotal</strong>
                          </td>
                          <td className="text-black">$350.00</td>
                        </tr>
                        <tr>
                          <td className="text-black font-weight-bold">
                            <strong>Order Total</strong>
                          </td>
                          <td className="text-black font-weight-bold">
                            <strong>$350.00</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="form-group">
                      <button
                        className="btn btn-black btn-lg py-3 btn-block"
                        onClick={() => (window.location.href = "thankyou.html")}
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* </form> */}
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;
