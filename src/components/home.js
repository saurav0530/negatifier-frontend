import React, { Component } from 'react';
import {Container, Form, Row, Col, Button, Stack, Alert, Spinner, Modal, ProgressBar} from 'react-bootstrap'

let url = 'https://evening-brushlands-57776.herokuapp.com'
// let url = 'http://localhost:4000'

class Home extends Component {
    state = {
		positive: 0,
		negative: 0,
		responses: null,
		master_roll: null,
		message: "Any alerts will appear here",
		variant: "success",
		isModalVisible: false,
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
		responses_style: {border:"1px solid #ced4da"},
		subject: "Python Mark Sheet",
		email_body: "CS384 2021 marks are attached for reference.",
		signature: "Dr. Mayank",
		noOfstudents: 1,
		email_sent: 0
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

	handleClose = (event) => {
		event.preventDefault()
		this.setState({
			isModalVisible : false
		})
	}
	handleClose1 = () => {
		this.setState({
			isModalVisible : false
		})
	}
	handleShow = (event) => {
		event.preventDefault()
		this.setState({
			isModalVisible : true
		})
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
							noOfstudents: data.data,
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
		console.log(this.state.subject,this.state.email_body,this.state.signature)
		this.setState({
			isModalVisible: false,
			isSendingEmail: true,
			isEmailDisabled: true,
			isDownloadMSDisabled: true,
			isGCMSDisabled: true,
			message:<>Sending emails <Spinner animation="border" size="sm" /></>
		})
		let formData = new FormData()

		formData.append('subject',this.state.subject)
		formData.append('body',this.state.email_body)
		formData.append('signature',this.state.signature)

		var index=1
		var myVar = setInterval(()=>{
			index += 1
			fetch(url+'/sendemail/'+index,{
				method:'POST',
				body: formData,
				credentials: "same-origin"
			})
			.then(resp =>{
				if(resp.status!==200)
					throw new Error()
				return resp.json()
			})
			.then(() =>{
				this.setState({
					email_sent: this.state.email_sent+1,
					message: <><ProgressBar variant="success" animated now={((this.state.email_sent*100)/this.state.noOfstudents)} label={Math.trunc(((this.state.email_sent*100)/this.state.noOfstudents))+'%'} /></>
				},()=>{
					if(this.state.noOfstudents === this.state.email_sent)
					{
						this.setState({
							message : "Email sent successfully"
						})
					}
				})
			})
			.catch(err => console.log(err))
			if(index===this.state.noOfstudents+1)
			{
				clearInterval(myVar)
				this.setState({
					message: "Email sent successfully",
					variant: "success",
					isSendingEmail: false,
					isEmailDisabled: true
				})
			}
		},1000)
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
			<Modal show={this.state.isModalVisible} onHide={this.handleClose1} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Send Email
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
							<Form.Label>Subject</Form.Label>
							<Form.Control placeholder={this.state.subject} onChange={this.onInputChange} name="subject" type="text" />
						</Form.Group>
						<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
							<Form.Label>Email Body</Form.Label>
							<Form.Control placeholder={this.state.email_body} onChange={this.onInputChange} name="email_body" as="textarea" rows={3} />
						</Form.Group>
						<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
							<Form.Label>Salutation</Form.Label>
							<Form.Control placeholder={this.state.signature} onChange={this.onInputChange} name="signature" as="textarea" rows={3} />
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					{/* <Button variant="secondary" onClick={this.handleClose}>Close</Button> */}
					<Button variant="success" onClick={this.onClickSendEmails}>Send Email</Button>
				</Modal.Footer>
			</Modal>

            <Container >
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
							{/* <Button variant={sendEmailVariant} disabled={this.state.isEmailDisabled} onClick={this.onClickSendEmails} type="submit" className="ms-auto" style={{width:'25%'}}>{sendemailButton}</Button> */}
							<Button variant={sendEmailVariant} disabled={this.state.isEmailDisabled} onClick={this.handleShow} type="submit" className="ms-auto" style={{width:'25%'}}>{sendemailButton}</Button>
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