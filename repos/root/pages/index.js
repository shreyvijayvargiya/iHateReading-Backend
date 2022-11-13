
import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Button } from '@material-ui/core';

const Home = () => {
	

	const { isAuthenticated, user, authenticate, logout } = useMoralis();
	

	async function login(){
		authenticate();
	};

	async function logoutUser(){
		logout()
	};


	return (
		<div>
			<h2>Moralis Introduction</h2>
			<Button onClick={login} size="small" color="primary" variant="contained">
				Login via wallet
			</Button>
			<Button onClick={logoutUser} size="small" color="primary" variant="outlined">
				Logout
			</Button>
		</div>
	)
};
export default Home
