import React, { useState } from 'react'
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBSpinner,
} from 'mdb-react-ui-kit'

import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AuthPage = () => {
  const [isLoad, setIsLoad] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const handleClick = () => {
    setIsLoad(true)
    axios
      .post('http://localhost:3001/auth/login', { username, password })
      .then((res) => {
        console.log('fdfd res', res)
        navigate('/chessboard')
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        setIsLoad(false)
      })
  }

  return (
    <MDBContainer className="my-5">
      <MDBCard>
        <MDBRow className="g-0">
          <MDBCol md="6">
            <MDBCardImage
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
              alt="login form"
              className="rounded-start w-100"
            />
          </MDBCol>

          <MDBCol md="6">
            <MDBCardBody className="d-flex flex-column">
              <div className="d-flex flex-row mt-2">
                <MDBIcon
                  fas
                  icon="chess fa-3x me-3"
                  style={{ color: '#ff6219' }}
                />
                <span className="h1 fw-bold mb-0">Chess stars</span>
              </div>

              <h5
                className="fw-normal my-4 pb-3"
                style={{ letterSpacing: '1px' }}
              >
                Sign into your account
              </h5>

              <MDBInput
                wrapperClass="mb-4"
                label="Email address"
                id="formControlLg"
                type="email"
                size="lg"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                }}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Password"
                id="formControlLg"
                type="password"
                size="lg"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                }}
              />

              {isLoad ? (
                <MDBSpinner className="mb-4" style={{ alignSelf: 'center' }} />
              ) : (
                <MDBBtn
                  className="mb-4 px-5"
                  color="dark"
                  size="lg"
                  onClick={handleClick}
                  rounded
                  style={{ height: 46, marginBottom: 0 }}
                >
                  Login
                </MDBBtn>
              )}
              <a className="small text-muted" href="#!">
                Forgot password?
              </a>
              <p className="mb-5 pb-lg-2" style={{ color: '#393f81' }}>
                Don't have an account?{' '}
                <a href="#!" style={{ color: '#393f81' }}>
                  Register here
                </a>
              </p>

              <div className="d-flex flex-row justify-content-start">
                <a href="#!" className="small text-muted me-1">
                  Terms of use.
                </a>
                <a href="#!" className="small text-muted">
                  Privacy policy
                </a>
              </div>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  )
}

export default AuthPage
