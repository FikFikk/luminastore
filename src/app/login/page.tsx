import React from 'react'

function page() {
  return (
    <div>
        <div id="root" className="h-100">
            {/* <!-- Background Start --> */}
            <div className="fixed-background"></div>
            {/* <!-- Background End --> */}

            <div className="container-fluid p-0 h-100 position-relative">
                <div className="row g-0 h-100">
                {/* <!-- Left Side Start --> */}
                <div className="offset-0 col-12 d-none d-lg-flex offset-md-1 col-lg h-lg-100">
                    <div className="min-h-100 d-flex align-items-center">
                    <div className="w-100 w-lg-75 w-xxl-50">
                        <div>
                        <div className="mb-5">
                            <h1 className="display-3 text-white">Multiple Niches</h1>
                            <h1 className="display-3 text-white">Ready for Your Project</h1>
                        </div>
                        <p className="h6 text-white lh-1-5 mb-5">
                            Dynamically target high-payoff intellectual capital for customized technologies. Objectively integrate emerging core competencies before
                            process-centric communities...
                        </p>
                        <div className="mb-5">
                            <a className="btn btn-lg btn-outline-white" href="index.html">Learn More</a>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                {/* <!-- Left Side End --> */}

                {/* <!-- Right Side Start --> */}
                <div className="col-12 col-lg-auto h-100 pb-4 px-4 pt-0 p-lg-0">
                    <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 full-page-content-right-border">
                    <div className="sw-lg-50 px-5">
                        <div className="sh-11">
                        <a href="index.html">
                            <div className="logo-default"></div>
                        </a>
                        </div>
                        <div className="mb-5">
                        <h2 className="cta-1 mb-0 text-primary">Welcome,</h2>
                        <h2 className="cta-1 text-primary">let's get started!</h2>
                        </div>
                        <div className="mb-5">
                        <p className="h6">Please use your credentials to login.</p>
                        <p className="h6">
                            If you are not a member, please
                            <a href="Pages.Authentication.Register.html">register</a>
                            .
                        </p>
                        </div>
                        <div>
                        <form id="loginForm" className="tooltip-end-bottom">
                            <div className="mb-3 filled form-group tooltip-end-top">
                            <i data-cs-icon="email"></i>
                            <input className="form-control" placeholder="Email" name="email" />
                            </div>
                            <div className="mb-3 filled form-group tooltip-end-top">
                            <i data-cs-icon="lock-off"></i>
                            <input className="form-control pe-7" name="password" type="password" placeholder="Password" />
                            <a className="text-small position-absolute t-3 e-3" href="Pages.Authentication.ForgotPassword.html">Forgot?</a>
                            </div>
                            <button type="submit" className="btn btn-lg btn-primary">Login</button>
                        </form>
                        </div>
                    </div>
                    </div>
                </div>
                {/* <!-- Right Side End --> */}
                </div>
            </div>
            </div>

            {/* <!-- Theme Settings Modal Start --> */}
            <div
            className="modal fade modal-right scroll-out-negative"
            id="settings"
            data-bs-backdrop="true"
            // tabindex="-1"
            role="dialog"
            aria-labelledby="settings"
            aria-hidden="true"
            >
            <div className="modal-dialog modal-dialog-scrollable full" role="document">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Theme Settings</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div className="modal-body">
                    <div className="scroll-track-visible">
                    <div className="mb-5" id="color">
                        <label className="mb-3 d-inline-block form-label">Color</label>
                        <div className="row d-flex g-3 justify-content-between flex-wrap mb-3">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="light-blue" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="blue-light"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">LIGHT BLUE</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="dark-blue" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="blue-dark"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">DARK BLUE</span>
                            </div>
                        </a>
                        </div>

                        <div className="row d-flex g-3 justify-content-between flex-wrap mb-3">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="light-red" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="red-light"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">LIGHT RED</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="dark-red" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="red-dark"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">DARK RED</span>
                            </div>
                        </a>
                        </div>

                        <div className="row d-flex g-3 justify-content-between flex-wrap mb-3">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="light-green" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="green-light"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">LIGHT GREEN</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="dark-green" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="green-dark"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">DARK GREEN</span>
                            </div>
                        </a>
                        </div>

                        <div className="row d-flex g-3 justify-content-between flex-wrap mb-3">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="light-purple" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="purple-light"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">LIGHT PURPLE</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="dark-purple" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="purple-dark"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">DARK PURPLE</span>
                            </div>
                        </a>
                        </div>

                        <div className="row d-flex g-3 justify-content-between flex-wrap mb-3">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="light-pink" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="pink-light"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">LIGHT PINK</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="dark-pink" data-parent="color">
                            <div className="card rounded-md p-3 mb-1 no-shadow color">
                            <div className="pink-dark"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">DARK PINK</span>
                            </div>
                        </a>
                        </div>
                    </div>

                    <div className="mb-5" id="navcolor">
                        <label className="mb-3 d-inline-block form-label">Override Nav Palette</label>
                        <div className="row d-flex g-3 justify-content-between flex-wrap">
                        <a href="#" className="flex-grow-1 w-33 option col" data-value="default" data-parent="navcolor">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-primary top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">DEFAULT</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-33 option col" data-value="light" data-parent="navcolor">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-secondary figure-light top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">LIGHT</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-33 option col" data-value="dark" data-parent="navcolor">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-muted figure-dark top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">DARK</span>
                            </div>
                        </a>
                        </div>
                    </div>

                    <div className="mb-5" id="placement">
                        <label className="mb-3 d-inline-block form-label">Menu Placement</label>
                        <div className="row d-flex g-3 justify-content-between flex-wrap">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="horizontal" data-parent="placement">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-primary top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">HORIZONTAL</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="vertical" data-parent="placement">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-primary left"></div>
                            <div className="figure figure-secondary right"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">VERTICAL</span>
                            </div>
                        </a>
                        </div>
                    </div>

                    <div className="mb-5" id="behaviour">
                        <label className="mb-3 d-inline-block form-label">Menu Behaviour</label>
                        <div className="row d-flex g-3 justify-content-between flex-wrap">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="pinned" data-parent="behaviour">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-primary left large"></div>
                            <div className="figure figure-secondary right small"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">PINNED</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="unpinned" data-parent="behaviour">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-primary left"></div>
                            <div className="figure figure-secondary right"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">UNPINNED</span>
                            </div>
                        </a>
                        </div>
                    </div>

                    <div className="mb-5" id="layout">
                        <label className="mb-3 d-inline-block form-label">Layout</label>
                        <div className="row d-flex g-3 justify-content-between flex-wrap">
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="fluid" data-parent="layout">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-primary top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">FLUID</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-50 option col" data-value="boxed" data-parent="layout">
                            <div className="card rounded-md p-3 mb-1 no-shadow">
                            <div className="figure figure-primary top"></div>
                            <div className="figure figure-secondary bottom small"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">BOXED</span>
                            </div>
                        </a>
                        </div>
                    </div>

                    <div className="mb-5" id="radius">
                        <label className="mb-3 d-inline-block form-label">Radius</label>
                        <div className="row d-flex g-3 justify-content-between flex-wrap">
                        <a href="#" className="flex-grow-1 w-33 option col" data-value="rounded" data-parent="radius">
                            <div className="card rounded-md radius-rounded p-3 mb-1 no-shadow">
                            <div className="figure figure-primary top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">ROUNDED</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-33 option col" data-value="standard" data-parent="radius">
                            <div className="card rounded-md radius-regular p-3 mb-1 no-shadow">
                            <div className="figure figure-primary top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">STANDARD</span>
                            </div>
                        </a>
                        <a href="#" className="flex-grow-1 w-33 option col" data-value="flat" data-parent="radius">
                            <div className="card rounded-md radius-flat p-3 mb-1 no-shadow">
                            <div className="figure figure-primary top"></div>
                            <div className="figure figure-secondary bottom"></div>
                            </div>
                            <div className="text-muted text-part">
                            <span className="text-extra-small align-middle">FLAT</span>
                            </div>
                        </a>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>

            <button type="button" className="btn settings-button btn-gradient-primary" data-bs-toggle="modal" data-bs-target="#settings" id="settingsButton">
            <i data-cs-icon="paint-roller" className="position-relative"></i>
            </button>
    </div>
  )
}

export default page