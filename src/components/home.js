import React, { Component } from 'react';
import {Navbar,Container, Form, Row, Col, Button, Stack, Alert, Spinner} from 'react-bootstrap'

// let url = 'https://evening-brushlands-57776.herokuapp.com'
let url = 'http://localhost:4000'

class Home extends Component {
    state = {
		positive: 0,
		negative: 0,
		responses: null,
		master_roll: null,
		message: "Any alerts will appear here",
		variant: "success",
		isUploadDisabled: true,
		isGCMSDisabled: true,
		isGMSDisabled: true,
		isDownloadMSDisabled: true,
		isEmailDisabled: true,
		isUploading: false,
		isGMSUploading: false,
		isGCMSUploading: false,
		isMSDownloading: false,
		isSendingEmail: false,
		master_style: {border:"1px solid #ced4da"},
		responses_style: {border:"1px solid #ced4da"}
	}

	invalidFileStyle = {border:"2px solid red"}

	upDateUploadButton = ()=>{
		if(this.state.responses && this.state.master_roll && this.state.positive)
		{
			this.setState({
				isUploadDisabled: false
			})
		}
	}

	onFileChange = (event)=>{
		if(!event.target.files.length)
			return
		if(event.target.files[0].type==='text/csv' || event.target.files[0].type==='application/vnd.ms-excel')
		{
			this.setState({
				[event.target.name] : event.target.files[0]
			},()=>this.upDateUploadButton())
			if(event.target.name==='master_roll')
				this.setState({master_style: {border:"1px solid #ced4da"}})
			else
				this.setState({responses_style: {border:"1px solid #ced4da"}})
		}
		else
		{
			if(event.target.name==='master_roll')
				this.setState({master_style:this.invalidFileStyle})
			else
				this.setState({responses_style: this.invalidFileStyle})
		}
	}
	onInputChange = (event)=>{
		this.setState({
			[event.target.name] : event.target.value
		},()=>this.upDateUploadButton())
	}
	onClickUpload =(event)=>{
		event.preventDefault()
		let formData = new FormData()

		this.setState({
			isUploadDisabled: true,
			isUploading: true,
			message: <>Uploading <Spinner animation="border" size="sm" /></>
		})

		formData.append('positive',this.state.positive)
		formData.append('negative',this.state.negative)
		formData.append('master_roll',this.state.master_roll)
		formData.append('responses',this.state.responses)

		fetch(url+'/upload',{
			method:'POST',
			body: formData,
			credentials: "same-origin"
		})
		.then(data =>{
			if(data.status!==200)
			{
				console.log(data.status)
				throw new Error("Error generated")
			}
			return data.json()
		})
		.then(response =>{
			this.setState({
				message : response.message,
				variant : response.variant,
				isUploading: false,
				isGMSDisabled: false
			})
		})
		.catch(err => {
			this.setState({
				message : "Error while uploading",
				variant : 'danger',
				isUploading: false,
				isUploadDisabled: false
			})
		})
	}
	onClickGMS =(event)=>{
		event.preventDefault()
		this.setState({
			isGMSUploading: true,
			isGMSDisabled: true,
			message: <>Generating Marksheet <Spinner animation="border" size="sm" /></>
		})
		fetch(url+'/generatemarksheet',{
			method:'POST',
			credentials: "same-origin"
		})
		.then(data =>{
			if(data.status!==202)
				throw new Error()
			return data.json()
		})
		.then(() =>{
			var myVar = setInterval(()=>{
				fetch(url+'/generatemarksheet/status')
				.then(data => data.json())
				.then(data =>{
					if(data.status!==202)
					{
						clearInterval(myVar)
						this.setState({
							message: data.message,
							variant: data.variant,
							isGMSUploading: false,
							isGMSDisabled: !(data.status===404),
							isUploadDisabled: !(data.status===404),
							isEmailDisabled: (data.status===404),
							isDownloadMSDisabled: (data.status===404),
							isGCMSDisabled : (data.status===404)
						})
					}
					else{
						this.setState({
							message : <>{data.message} <Spinner animation="border" size="sm" /></>,
							variant : data.variant
						})
					}
				})
				.catch(err => console.log(err))
			},5000)
		})
		.catch(err => {
			this.setState({
				message : "Error while generating marksheet",
				variant : 'danger',
				isGMSUploading: false,
				isGMSDisabled: false,
				isUploadDisabled: false
			})
		})
	}

	onClickGCMS =(event)=>{
		event.preventDefault()
		this.setState({
			isGCMSUploading: true,
			isGCMSDisabled:true,
			isDownloadMSDisabled: true,
			isEmailDisabled: true,
			message: <>Generating Concise Marksheet <Spinner animation="border" size="sm" /></>
		})
		fetch(url+'/generateconcisemarksheet',{
			method:'POST',
			credentials: "same-origin"
		})
		.then(data =>{
			if(data.status!==202)
				throw new Error()
			return data.json()
		})
		.then(() =>{
			var myVar = setInterval(()=>{
				fetch(url+'/generateconcisemarksheet/status')
				.then(data => data.json())
				.then(data =>{
					if(data.status!==202)
					{
						clearInterval(myVar)
						this.setState({
							message: data.message,
							variant: data.variant,
							isGCMSUploading: false,
							isGCMSDisabled : !(data.status===404),
							isDownloadMSDisabled: false,
							isEmailDisabled: false,
						})
					}
					else{
						this.setState({
							message : <>{data.message} <Spinner animation="border" size="sm" /></>,
							variant : data.variant
						})
					}
				})
				.catch(err => console.log(err))
			},5000)
		})
		.catch(err => {
			this.setState({
				message : "Error while generating concise marksheet",
				variant : 'danger',
				isGCMSUploading: false,
				isGCMSDisabled: false,
				isDownloadMSDisabled: false,
				isEmailDisabled: false,
			})
		})
	}
	
	onClickDownload = (event)=>{
		event.preventDefault()
		this.setState({
			isMSDownloading: true,
			isDownloadMSDisabled: true,
			isEmailDisabled: true,
			message: <>Compressing Marksheet Folder <Spinner animation="border" size="sm" /></>
		})
		fetch(url+'/download/marksheet')
		.then(data =>{
			if(data.status!==200)
				throw new Error()
			return data.blob()
		})
		.then(blob => {
			let url = window.URL.createObjectURL(blob);
			let a = document.createElement('a');
			a.href = url;
			a.download = 'marksheet.zip';
			a.click();
			this.setState({
				isMSDownloading: false,
				isEmailDisabled: false,
				isDownloadMSDisabled: false,
				message: <>Marksheet Downloaded successfully</>
			})
		})
		.catch(err => {
			this.setState({
				message : "Error while compressing/downloading",
				variant : 'danger',
				isMSDownloading: false,
				isEmailDisabled: false,
				isDownloadMSDisabled: false,
			})
		})
	}

	onClickSendEmails = (event)=>{
		event.preventDefault()
		console.log("Hi from send email")
		this.setState({
			isSendingEmail: true,
			isEmailDisabled: true,
			isDownloadMSDisabled: true,
			isGCMSDisabled: true,
			message: <>Sending Email <Spinner animation="border" size="sm" /></>
		})
		fetch(url+'/sendemail')
		.then(resp =>{
			if(resp.status!==202)
				throw new Error()
			return resp.json()
		})
		.then(() =>{
			var myVar = setInterval(()=>{
				fetch(url+'/sendemail/status')
				.then(data => data.json())
				.then(data =>{
					if(data.status!==202)
					{
						clearInterval(myVar)
						this.setState({
							message: data.message,
							variant: data.variant,
							isDownloadMSDisabled: false,
							isGCMSDisabled: true,
							isSendingEmail: false
						})
					}
					else{
						this.setState({
							message : <>{data.message} <Spinner animation="border" size="sm" /></>,
							variant : data.variant
						})
					}
				})
				.catch(err => console.log(err))
			},10000)
		})
		.catch(err => {
			console.log(err)
			this.setState({
				message : "Error while sending email",
				variant : 'danger',
				isEmailDisabled: false,
				isDownloadMSDisabled: false,
				isGCMSDisabled: false,
				isSendingEmail: false
			})
		})
	}


	render() {
		var uploadButton, GMSButton, sendemailButton, GCMButton, downloadMSButton
		var uploadVariant, GMSVariant, GCMSVariant, downloadVariant, sendEmailVariant
		var spin = <>
			<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
			<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
			<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
		</>
		
		uploadButton= (this.state.isUploading)?spin:'Upload'
		GMSButton = (this.state.isGMSUploading)?spin:'Generate Marksheets'
		GCMButton = (this.state.isGCMSUploading)?spin:'Generate Concise Marksheet'
		downloadMSButton = (this.state.isMSDownloading)?spin:'Download Marksheet'
		sendemailButton = (this.state.isSendingEmail)?spin:'Send Email'

		uploadVariant = (this.state.isUploading || !this.state.isUploadDisabled)?'success':'secondary'
		GMSVariant = (this.state.isGMSUploading || !this.state.isGMSDisabled)?'success':'secondary'
		GCMSVariant = (this.state.isGCMSUploading || !this.state.isGCMSDisabled)?'success':'secondary'
		downloadVariant = (this.state.isMSDownloading || !this.state.isDownloadMSDisabled)?'success':'secondary'
		sendEmailVariant = (this.state.isSendingEmail || !this.state.isEmailDisabled)?'success':'secondary'

        return (
            <>
            <Navbar bg="success" variant="dark" fixed='top'>
                <Container className="justify-content-center"><Navbar.Brand href="#home" ><center>MARKS NEGATIFIER</center></Navbar.Brand></Container>
            </Navbar>
			
            <Container style={{width:'100vw',marginTop:'15vh'}}>
				<Alert variant={this.state.variant} style={{borderColor:'black'}}>{this.state.message}</Alert>
                <Form style={{borderColor:'black'}}>
				<Stack gap={2} style={{padding:'3pt 5pt'}} >
					
						<Form.Group as={Row} controlId="formPlaintextPassword" className="mb-3" >
							<Form.Label column sm="3">
								Marks for correct answer
							</Form.Label>
							<Col sm="9">
								<Form.Control name='positive' onChange={this.onInputChange} type="text" placeholder="Enter marks to be given for correct answers" />
							</Col>
						</Form.Group>
			
						<Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
							<Form.Label column sm="3">
								Marks for incorrect answer
							</Form.Label>
							<Col sm="9">
								<Form.Control name='negative' onChange={this.onInputChange} type="text" placeholder="Enter marks to be deducted for incorrect answers(default is 0)" />
							</Col>
						</Form.Group>
					
						<Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
							<Form.Label column sm="3">
								Choose file for master_roll.csv
							</Form.Label>
							<Col sm="9">
								<Form.Control name='master_roll' style={this.state.master_style} onChange={this.onFileChange} type="file" />
							</Col>
						</Form.Group>
					
						<Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
							<Form.Label column sm="3" >
								Choose file for responses.csv
							</Form.Label>
							<Col sm="9">
								<Form.Control name='responses' style={this.state.responses_style} onChange={this.onFileChange} type="file" />
							</Col>
						</Form.Group>
						<Button variant={uploadVariant} disabled={this.state.isUploadDisabled} onClick={this.onClickUpload} type="submit" className="ms-auto" style={{width:'100%'}}>{uploadButton}</Button>

						<Stack direction="horizontal" gap={3}>
							<Button variant={GMSVariant} disabled={this.state.isGMSDisabled} onClick={this.onClickGMS} type="submit" className="ms-auto" style={{width:'25%'}}>{GMSButton}</Button>
							<Button variant={GCMSVariant} disabled={this.state.isGCMSDisabled} onClick={this.onClickGCMS} type="submit" className="ms-auto" style={{width:'25%'}}>{GCMButton}</Button>
							<Button variant={downloadVariant} disabled={this.state.isDownloadMSDisabled} onClick={this.onClickDownload} type="submit" className="ms-auto" style={{width:'25%'}}>{downloadMSButton}</Button>
							<Button variant={sendEmailVariant} disabled={this.state.isEmailDisabled} onClick={this.onClickSendEmails} type="submit" className="ms-auto" style={{width:'25%'}}>{sendemailButton}</Button>
						</Stack>
						
				</Stack>
				
			</Form>
        	</Container>
            
			{/* <Alert variant={this.state.variant} style={{borderColor:'black'}} fixed="top">Made by Saurav Kumar(1901EE54)</Alert> */}
			
            </>
        );
    }
}

export default Home;