import axios, { AxiosRequestConfig } from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { MdOutlineWarningAmber } from 'react-icons/md';
import { signIn, useSession } from 'next-auth/react';
import { v4 as uuid } from 'uuid';
import { AiFillGithub } from 'react-icons/ai';
import { storeToken } from '../helpers';
import styles from '../styles/login.module.css';
import { ILoginRequest, ILoginResponse, IRegisterUserRequest, IRegisterUserResponse, IUser } from '../interfaces';
import errorList from '../helpers/errorList';
import handleAxios from '../helpers/handleAxios';

function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorExist, setErrorExist] = useState<boolean>(false);
  const [checkUser, setCheckUser] = useState<IUser | boolean>();
  const router = useRouter();
  const { data: session } = useSession();

  const handleError = (error: keyof typeof errorList) => {
    const message = errorList[error];

    setErrorExist(true);

    setErrorMessage(message || error);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = { email, password };
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/user/login`;

    try {
      const response = await handleAxios<
        ILoginResponse,
        ILoginRequest
      >('post', endpoint, user);

      storeToken(response.token);
      router.push('/workspace');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response);
        handleError(error.response?.data.error.message);
      }
    }
  };

  useEffect(() => {
    if (session) {
      const emailExist = async (auth0Email: string) => {
        try {
          const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/user/search?q=${auth0Email}`;

          const data = await handleAxios<
          IUser,
          AxiosRequestConfig
          >('get', endpoint);

          setCheckUser(data);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.log(error);
            setCheckUser(false);
          }
        }
      };

      const loginAuth0 = async (userEmail: string) => {
        const loginEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/user/login`;

        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/user/search?q=${userEmail}`;
        const data = await handleAxios<
        IUser,
        AxiosRequestConfig
        >('get', endpoint);

        const user = { email: userEmail, password: data.uuid as string };

        try {
          const response = await handleAxios<
            ILoginResponse,
            ILoginRequest
            >('post', loginEndpoint, user);

          storeToken(response.token);
          router.push('/workspace');
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
        }
      };

      const serializeUser = (userEmail: string, name: string) => {
        const [firstName, lastName] = name.split(' ');
        const randomPassword = uuid();

        return { firstName,
          lastName,
          password: randomPassword.slice(1, 15),
          email: userEmail,
          uuid: randomPassword.slice(1, 15) };
      };

      const registerAuth0 = async (userEmail: string, name: string) => {
        const newUser = serializeUser(userEmail, name);

        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/user/register`;

        try {
          await handleAxios<IRegisterUserResponse, IRegisterUserRequest>('post', endpoint, newUser);

          await loginAuth0(userEmail);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
        }
      };

      const handleAuth0 = async () => {
        if (session?.user?.email && session?.user?.name) {
          if (!checkUser) await emailExist(session.user.email);

          if (checkUser) loginAuth0(session.user.email);
          if (checkUser === false) registerAuth0(session.user.email, session.user.name);
        }
      };

      handleAuth0();
    }
  }, [session?.user?.email, router, session, checkUser]);

  return (
    <form onSubmit={handleSubmit} className={ styles.formLogin }>
      <label htmlFor="emailLogin">
        Email
        <input
          type="email"
          placeholder="Email"
          id="emailLogin"
          value={email}
          onChange={({ target }) => setEmail(target.value)}
        />
      </label>
      <label htmlFor="passwordLogin">
        Password
        <input
          type="password"
          placeholder="Password"
          id="passwordLogin"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </label>
      { errorExist && (
        <div className={ styles.errorMessage }>
          <MdOutlineWarningAmber className={ styles.warnigPlate } />
          <p>
            { errorMessage }
          </p>
        </div>
      ) }
      <button className={ styles.loginBtn } type="submit">Login</button>
      <button
        type="button"
        className={ styles.githubLogin }
        onClick={() => signIn('github')}
      >
        <AiFillGithub />
        <p>Entre com o GitHub</p>
      </button>
    </form>
  );
}

export default Login;
