"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Tab, Tabs, Form } from "react-bootstrap";
import image from "@/assets/images/resources/login-1-1.jpg";
import Image from "next/image";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
const LoginSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordVisibility = (e: any) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };
  // Use React Hook Form for both login and registration
  const {
    register: loginRegister,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();
  const {
    register: registerRegister,
    handleSubmit: registerHandleSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>();

  // Login Form Submit Handler
  const onLoginSubmit: SubmitHandler<LoginFormData> = (data) => {
    console.log("Login Data:", data);
  };

  // Register Form Submit Handler
  const onRegisterSubmit: SubmitHandler<RegisterFormData> = (data) => {
    console.log("Register Data:", data);
  };

  return (
    <section className='login-page section-space'>
      <div className='container'>
        <div className='row gutter-y-40 align-items-center'>
          <div className='col-lg-6'>
            <div className='login-page__thumb'>
              <Image src={image} alt='gotur image' />
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='login-page__content'>
              <div className='login-page__main-tab-box tabs-box'>
                <div className='login-page__top'>
                  <div className='login-page__top__left'>
                    <h2 className='login-page__top__section-title'>Welcome</h2>
                    <p className='login-page__top__section-subtitle'>
                      Sign in your account
                    </p>
                  </div>
                  <div className='login-page__top__btn tab-buttons'>
                    <button
                      onClick={() => setActiveTab("login")}
                      className={`tab-btn gotur-btn ${
                        activeTab === "login" ? "active-btn" : ""
                      }`}
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => setActiveTab("register")}
                      className={`tab-btn gotur-btn ${
                        activeTab === "register" ? "active-btn" : ""
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className='tabs-content'>
                  <div
                    className={`tabs-content__item tab wow fadeInUp ${
                      activeTab === "login" ? "active-tab" : ""
                    }`}
                  >
                    <Form onSubmit={loginHandleSubmit(onLoginSubmit)}>
                      <div className='login-page__group'>
                        <div className='login-page__input-box'>
                          <i className='icon-email'></i>

                          <input
                            type='text'
                            placeholder='Enter your email'
                            {...loginRegister("email", {
                              required: "Email is required",
                            })}
                          />
                        </div>

                        <div className='login-page__input-box'>
                          <i className='icon-padlock'></i>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder='Password'
                            {...loginRegister("password", {
                              required: "Password is required",
                            })}
                          />
                          <span
                            onClick={(e) => togglePasswordVisibility(e)}
                            className={`toggle-password pass-field-icon fa fa-fw ${
                              showPassword ? "fa-eye" : "fa-eye-slash"
                            }`}
                          ></span>
                        </div>

                        <div className='login-page__input-box login-page__input-box--bottom'>
                          <div className='login-page__input-box__inner'>
                            <input
                              id='rememberMe'
                              type='checkbox'
                              className='login-page__input-box__inner'
                              {...loginRegister("rememberMe")}
                            />
                            <label htmlFor='rememberMe'>Remember me</label>
                          </div>

                          <Link href='#' className='login-page__form__forgot'>
                            forgot password?
                          </Link>
                        </div>

                        <div className='login-page__input-box'>
                          <div className='login-page__input-box__btn'>
                            <button type='submit' className='gotur-btn'>
                              log in
                            </button>
                          </div>
                        </div>
                      </div>
                    </Form>
                    <p className='login-page__form__text'>
                      don’t have an account?<Link href='login'>register</Link>
                    </p>
                  </div>
                  <div
                    className={`tabs-content__item tab wow fadeInUp ${
                      activeTab === "register" ? "active-tab" : ""
                    } `}
                  >
                    <Form onSubmit={registerHandleSubmit(onRegisterSubmit)}>
                      <div className='login-page__group'>
                        <div className='login-page__input-box'>
                          <i className='icon-email'></i>

                          <input
                            type='text'
                            placeholder='Enter your email'
                            {...registerRegister("email", {
                              required: "Email is required",
                            })}
                          />
                        </div>

                        <div className='login-page__input-box'>
                          <i className='icon-padlock'></i>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder='Password'
                            {...registerRegister("password", {
                              required: "Password is required",
                            })}
                          />
                          <span
                            onClick={(e) => togglePasswordVisibility(e)}
                            className={`toggle-password pass-field-icon fa fa-fw ${
                              showPassword ? "fa-eye" : "fa-eye-slash"
                            }`}
                          ></span>
                        </div>

                        <div className='login-page__input-box login-page__input-box--bottom'>
                          <div className='login-page__input-box__inner'>
                            <input
                              id='rememberMe2'
                              type='checkbox'
                              className='login-page__input-box__inner'
                              {...loginRegister("rememberMe")}
                            />
                            <label htmlFor='rememberMe2'>Remember me</label>
                          </div>

                          <Link href='#' className='login-page__form__forgot'>
                            forgot password?
                          </Link>
                        </div>

                        <div className='login-page__input-box'>
                          <div className='login-page__input-box__btn'>
                            <button type='submit' className='gotur-btn'>
                              Register
                            </button>
                          </div>
                        </div>
                      </div>
                    </Form>
                    <p className='login-page__form__text'>
                      don’t have an account?<Link href='login'>Login</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginSection;
