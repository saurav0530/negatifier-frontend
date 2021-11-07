import React, { Component } from 'react';
import {Container, Form, Row, Col, Button, Stack, Alert, Spinner,Accordion,Modal, Badge,InputGroup,FormControl} from 'react-bootstrap'

// const url = 'http://localhost:4000'
const url = 'https://transcriptiitp.herokuapp.com'

class Transcript extends Component {
	state = {
		message: "Any alerts appear here",
		variant: "success",
		israngeHTMLSelected: false,
		startRoll: "",
		endRoll: "",
		grades: undefined,
		name_roll: undefined,
		subject_master: undefined,
		successful: [],
		unsuccessful: [],
		isUploadDisabled: true,
		isDownloadDisabled: true,
		isUploading: false,
		isDownloading: false,
		isModalVisible: false,
		isShowReportDisabled: true,
		isStampDisabled: true,
		isSignatureDisabled: true,
		signature_check: false,
		stamp_check: false,
		signature: undefined,
		stamp: undefined
	}
	onCheckChange = (event)=>{
		if(event.target.name==="signature_check")
			this.setState({
				[event.target.name] : !this.state.signature_check,
				isSignatureDisabled: this.state.signature_check
			})
		else
			this.setState({
				[event.target.name] : !this.state.stamp_check,
				isStampDisabled: this.state.stamp_check
			})
	}
	onInputChange = (event)=>{
		this.setState({
			[event.target.name] : event.target.value.toUpperCase()
		},()=>{
			if(this.state.grades && this.state.name_roll && this.state.subject_master && this.state.startRoll && this.state.endRoll)
				this.setState({
					isUploadDisabled: false,
					isUploading: false,
					isDownloading: false,
					isDownloadDisabled: true
				})
			else
				this.setState({
					isUploadDisabled: true,
					isDownloadDisabled: true,
					isUploading: false,
					isDownloading: false,
				})
		})
	}
	onFileChange1 = (event)=>{
		if(!event.target.files.length)
			return
		this.setState({
			[event.target.name] : event.target.files[0]
		})
	}
	onFileChange = (event)=>{
		if(!event.target.files.length)
			return
		if(event.target.files[0].type==='text/csv' || event.target.files[0].type==='application/vnd.ms-excel')
		{
			this.setState({
				[event.target.name] : event.target.files[0]
			},()=>{
				if(this.state.grades && this.state.name_roll && this.state.subject_master && this.state.startRoll && this.state.endRoll)
					this.setState({
						isUploadDisabled: false,
						isDownloadDisabled: true,
						isUploading: false,
						isDownloading: false,
					})
				else
				this.setState({
					isUploadDisabled: true,
					isDownloadDisabled: true,
					isUploading: false,
					isDownloading: false,
				})
			})
			this.setState({
				message:"No errors", 
				variant: "success"
			})
		}
		else
		{
			this.setState({
				message:"Invalid "+event.target.name+" format", 
				variant: "danger"
			})
		}
	}
	onUpload=(event)=>{
		var formdata1 = new FormData()
		formdata1.append('startRoll',this.state.startRoll)
		formdata1.append('endRoll',this.state.endRoll)
		this.setState({
			isUploadDisabled: true,
			isUploading: true,
			isShowReportDisabled: true
		})
		event.preventDefault()
		fetch(url+'/check-roll',{
			method:"POST",
			body:formdata1
		})
		.then(data => {
			if(data.status===200)
			{
				if(this.state.startRoll.substr(0,6) !== this.state.endRoll.substr(0,6))
				{
					this.setState({
						message: "Invalid roll",
						variant: "danger",
						isUploadDisabled: false,
						isUploading: false
					})
					return
				}
				if(Number(this.state.startRoll.substr(6,2))>Number(this.state.endRoll.substr(6,2)))
				{
					this.setState({
						message: "Invalid range",
						variant: "danger",
						isUploadDisabled: false,
						isUploading: false
					})
					return
				}
				if(this.state.signature_check && !this.state.signature)
				{
					this.setState({
						message: "Please select signature file or unmark corresponding checkbox.",
						variant: "danger",
						isUploading: false,
						isUploadDisabled: false
					})
					return
				}
				if(this.state.stamp_check && !this.state.stamp)
				{
					this.setState({
						message: "Please select IITP Stamp file or unmark corresponding checkbox.",
						variant: "danger",
						isUploading: false,
						isUploadDisabled: false
					})
					return
				}
				var formdata = new FormData()
				formdata.append('roll',this.state.individualRoll)
				formdata.append('grades',this.state.grades)
				formdata.append('subject_master',this.state.subject_master)
				formdata.append('names_roll',this.state.name_roll)
				formdata.append('isSignature',this.state.signature_check)
				formdata.append('isStamp',this.state.stamp_check)
				if(this.state.signature_check)
				{
					formdata.append('signature',this.state.signature)
					console.log(this.state.signature)
				}
				if(this.state.stamp_check)
				{	
					formdata.append('stamp',this.state.stamp)
					console.log(this.state.stamp)
				}

				fetch(url+'/uploadFiles',{
					method:'POST',
					body: formdata
				})
				.then(data => {
					
					if(data.status === 200)
					{
						this.setState({
							message: <>Files uploaded successfully... Processing transcripts <Spinner animation="border" size="sm" /></>,
							variant: "success",
							successful: [],
							unsuccessful: []
						})
						return 
					}
					else
						throw Error()
				})
				.then(() => {
					var start = Number(this.state.startRoll.substr(6,2))
					var end = Number(this.state.endRoll.substr(6,2))
					var pref = this.state.startRoll.substr(0,6)
					var semiurl = pref.substr(2,2)
					var diff = end-start+1
					var formdata2 = new FormData()
					formdata2.append('sign',this.state.signature_check)
					formdata2.append('stamp',this.state.stamp_check)
					for(start; start<=end; start++)
					{
						var reqRoll = String(start)
						if(reqRoll.length===1)
							reqRoll = '0'+reqRoll
						reqRoll = pref+reqRoll
						fetch(url+"/transcript/"+semiurl+"/"+reqRoll,{
							method: "POST",
							body: formdata2
						})
						.then(data => data.json())
						.then(data=>{
							if(data.status==='0')
								this.setState({
									unsuccessful: [...this.state.unsuccessful,<><Badge bg="success">{data.roll}</Badge>{' '}</>]
								},()=>{
									if(this.state.successful.length+this.state.unsuccessful.length===diff){
										this.setState({
											message:"Transcripts generated successfully",
											variant: "success",
											isDownloadDisabled: false,
											isUploading: false,
											isModalVisible: true,
											isShowReportDisabled: false
										})
									}
								})
							else
								this.setState({
									successful: [...this.state.successful,<><Badge bg="danger">{data.roll}</Badge>{' '}</>]
								},()=>{
									if(this.state.successful.length+this.state.unsuccessful.length===diff){
										this.setState({
											message:"Transcripts generated successfully",
											variant: "success",
											isDownloadDisabled: false,
											isUploading: false,
											isModalVisible: true,
											isShowReportDisabled: false
										})
									}
								})
						})
						.catch(err=>console.log(err))
					}


				})
				.catch(err=>{
					this.setState({
						message: "Error while uploading files",
						variant: "danger",
						isUploadDisabled: false,
						isUploading: false
					})
				})		
			}
			else
				this.setState({
					message: "Invalid roll",
					variant: "danger",
					isUploadDisabled: false,
					isUploading: false
				})
		})		
		.catch(()=>{
			this.setState({
				message: "Invalid roll",
				variant: "danger",
				isUploadDisabled: false,
				isUploading: false
			})
		})
	}
	onClickDownload = (event)=>{
		event.preventDefault()
		this.setState({
			isDownloadDisabled: true,
			isDownloading: true
		})
		fetch(url+'/download')
		.then(data =>{
			if(data.status!==200)
				throw new Error()
			return data.blob()
		})
		.then(blob => {
			let url = window.URL.createObjectURL(blob);
			let a = document.createElement('a');
			a.href = url;
			a.download = 'transcriptIITP.zip';
			a.click();
			this.setState({
				isDownloading:false
			})
		})
		.catch(err => {console.log(err)})
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
    render() {
		var rangeHTML = <>
		<Form.Group as={Row} className="mb-0" controlId="formPlaintextPassword">
			<Form.Label column sm="3">
				Roll Range
			</Form.Label>
			<Col sm="5">
			<Form.Control name='startRoll' value={this.state.startRoll} onChange={this.onInputChange} type="text" placeholder="Start roll" />
			</Col>
			<Col sm="4">
			<Form.Control name='endRoll' value={this.state.endRoll} onChange={this.onInputChange} type="text" placeholder="End roll" />
			</Col>
		</Form.Group>
		</>
		var loading = <>
			<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
			<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
			<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
		</>
		var downloadButton = ((this.state.isDownloading)?loading:"Download")
		var uploadButton = ((this.state.isUploading)?loading:"Upload & Generate")
	
        return (
            <>	
			<Modal show={this.state.isModalVisible} onHide={this.handleClose1} size="lg">
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Generate Transcript Status 
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
				<Accordion defaultActiveKey="0">
					<Accordion.Item eventKey="0">
						<Accordion.Header>Successful</Accordion.Header>
						<Accordion.Body>
							{this.state.successful}
						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="1">
						<Accordion.Header>Not Found</Accordion.Header>
						<Accordion.Body>
							{this.state.unsuccessful}
						</Accordion.Body>
					</Accordion.Item>
					</Accordion>
				</Modal.Body>
			</Modal>
             <Container>
			 	<Alert variant={this.state.variant} style={{borderColor:'black'}}>{this.state.message}</Alert>
						<Form style={{borderColor:'black'}}>
						
						<Stack gap={2} style={{padding:'3pt 5pt'}} >
							{rangeHTML}
							
							<Form.Group as={Row} className="mb-0" controlId="formPlaintextPassword">
								<Form.Label column sm="3">
									Choose file for grades.csv
								</Form.Label>
								<Col sm="9">
									<Form.Control name='grades' onChange={this.onFileChange} type="file" />
									{/* <Form.Text className="text-muted">
										Image size should be 100pt x 30pt.
									</Form.Text> */}
								</Col>
							</Form.Group>
						
							<Form.Group as={Row} className="mb-0" controlId="formPlaintextPassword">
								<Form.Label column sm="3" >
									Choose file for name_roll.csv
								</Form.Label>
								<Col sm="9">
									<Form.Control name='name_roll' onChange={this.onFileChange} type="file" />
								</Col>
							</Form.Group>
							<Form.Group as={Row} className="mb-0" controlId="formPlaintextPassword">
								<Form.Label column sm="3" >
									Choose file for subject_master.csv
								</Form.Label>
								<Col sm="9">
									<Form.Control name='subject_master' onChange={this.onFileChange} type="file" />
								</Col>
							</Form.Group>
							<Form.Group as={Row} className="mb-0" controlId="formPlaintextPassword">
								<Form.Label column sm="3" >
									Assistant Registrar Signature
								</Form.Label>
								<Col sm="9">
									<InputGroup className="mb-0">
										<InputGroup.Checkbox name="signature_check" onClick={this.onCheckChange}/>
										<FormControl type='file' name="signature" onChange={this.onFileChange1} disabled={this.state.isSignatureDisabled} />
									</InputGroup>
								</Col>
							</Form.Group>
							<Form.Group as={Row} className="mb-0" controlId="formPlaintextPassword">
								<Form.Label column sm="3" >
									IITP Stamp
								</Form.Label>
								<Col sm="9">
									<InputGroup className="mb-3">
										<InputGroup.Checkbox name="stamp_check" onClick={this.onCheckChange}/>
										<FormControl type='file' name='stamp' onChange={this.onFileChange1} disabled={this.state.isStampDisabled}/>
									</InputGroup>
								</Col>
							</Form.Group>
							<Button variant="primary" disabled={this.state.isUploadDisabled} type="submit" onClick={this.onUpload} className="ms-auto" style={{width:'100%'}}>{uploadButton}</Button>
							<Button variant="primary" disabled={this.state.isShowReportDisabled} type="submit" onClick={this.handleShow} className="ms-auto" style={{width:'100%'}}>Show Report</Button>
							<Button variant="success" disabled={this.state.isDownloadDisabled} type="submit" onClick={this.onClickDownload} className="ms-auto" style={{width:'100%'}}>{downloadButton}</Button>

						</Stack>
						
						</Form>
        	</Container>   
            </>
        );
    }
}

export default Transcript;