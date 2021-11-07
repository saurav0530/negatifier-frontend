import React, { Component } from 'react';
import {Container, Form, Col, Button, Stack, Alert, Spinner,Accordion,Modal,InputGroup,FormControl} from 'react-bootstrap'

// const url = 'http://localhost:4000'
const url = 'https://transcriptiitp.herokuapp.com'

class Transcript extends Component {
	state = {
		message: "Any alerts will appear here",
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
		stamp: undefined,
		isInputDisabled: true,
		requestType: "1"
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
			if(this.state.requestType==="2")
				this.setState({
					isInputDisabled: false
				})
			else if(this.state.requestType==="1")
				this.setState({
					isInputDisabled: true
				})
			if(this.state.grades && this.state.name_roll && this.state.subject_master && (this.state.requestType==="1" || (this.state.requestType==="2" && this.state.startRoll && this.state.endRoll)))
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
				if(this.state.grades && this.state.name_roll && this.state.subject_master && (this.state.requestType==="1" || (this.state.requestType==="2" && this.state.startRoll && this.state.endRoll)))
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
		event.preventDefault()
		var formdata1 = new FormData()
		formdata1.append('startRoll',this.state.startRoll)
		formdata1.append('endRoll',this.state.endRoll)
		this.setState({
			isUploadDisabled: true,
			isUploading: true,
			isShowReportDisabled: true,
			message : <>Validating inputs <Spinner animation="border" size="sm" /></>,
			variant: "success"
		})
		

		if(this.state.requestType==="1")
		{
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
			formdata.append('grades',this.state.grades)
			formdata.append('subject_master',this.state.subject_master)
			formdata.append('names_roll',this.state.name_roll)
			formdata.append('isSignature',this.state.signature_check)
			formdata.append('isStamp',this.state.stamp_check)
			if(this.state.signature_check)
			{
				formdata.append('signature',this.state.signature)
			}
			if(this.state.stamp_check)
			{	
				formdata.append('stamp',this.state.stamp)
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
			.then(()=>{
				var formdata2 = new FormData()
				formdata2.append('sign',this.state.signature_check)
				formdata2.append('stamp',this.state.stamp_check)
				fetch(url+'/transcript/entireRange',{
					method: "POST",
					body: formdata2
				})
				.then((data1)=>{
					if(data1.status===202)
					{
						var myVar = setInterval(()=>{
							fetch(url+'/transcript/entireRange/status')
							.then(data=>{
								if(data.status===202)
								{
									this.setState({
										message: <>Generating transcripts <Spinner animation="border" size="sm" /></>,
										variant: "success"
									})
								}
								if(data.status===200)
								{
									clearInterval(myVar)
									this.setState({
										message: "Transcripts generated successfully",
										variant: "success",
										successful: <Button variant="success">All generated successfully</Button>,
										unsuccessful: <Button variant="danger">No errors found</Button>,
										isUploading: false,
										isShowReportDisabled: false,
										isDownloadDisabled: false,
										isModalVisible: true
									})
								}
							})
							.catch(err=>console.log(err))
						},2000)
						
					}
				})
				.catch(err=>{
					this.setState({
						message: "Error while connecting to server",
						variant: "danger",
						isUploading: false,
						isUploadDisabled: false
					})
				})
			})
			.catch(err=>{
				this.setState({
					message: "Error while uploading files",
					variant: "danger",
					isUploadDisabled: false,
					isUploading: false
				})
			})	
			return
		}

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
				this.setState({
					message:<>Validation successful... Uploading data <Spinner animation="border" size="sm" /></>,
					variant: "success"
				})
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
				}
				if(this.state.stamp_check)
				{	
					formdata.append('stamp',this.state.stamp)
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
									unsuccessful: [...this.state.unsuccessful,<><Button variant="danger">{data.roll}</Button>{' '}</>]
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
									successful: [...this.state.successful,<><Button variant="success">{data.roll}</Button>{' '}</>]
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
			isDownloading: true,
			message: <>Processing request... <Spinner animation="border" size="sm" /></>,
			variant: "success"
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
				isDownloading:false,
				message: "Downloaded successfully...",
				variant: "success"
			})
		})
		.catch(err => {
			console.log(err)
			this.setState({
				message: "Error while downloading/compressing...",
				variant: "danger",
				isDownloading: false,
				isInputDisabled: false
			})
		})
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
							<InputGroup className="mb-0">
								<Col sm="3">
									<Form.Select name="requestType" style={{backgroundColor:"skyblue",color:"black"}} onChange={this.onInputChange}>
										<option value="1">Entire Range</option>
										<option value="2">Roll range</option>
									</Form.Select>
								</Col>
								<Col sm="9">
								<Stack direction='horizontal' gap={0}>
									<Form.Control disabled={this.state.isInputDisabled} name='startRoll' value={this.state.startRoll} onChange={this.onInputChange} type="text" placeholder="Start roll" />
									<Form.Control disabled={this.state.isInputDisabled} name='endRoll' value={this.state.endRoll} onChange={this.onInputChange} type="text" placeholder="End roll" />
								</Stack>
								</Col>
							</InputGroup>
							
							<InputGroup className="mb-0">
								<Col sm="3">
									<InputGroup.Text style={{backgroundColor:"#c5c7c1"}} id="basic-addon1">Choose file for grades.csv</InputGroup.Text>
								</Col>
								<Col sm="9">
								<Stack direction='horizontal' gap={0}>
									<Form.Control name='grades' onChange={this.onFileChange} type="file" />
								</Stack>
								</Col>
							</InputGroup>

							<InputGroup className="mb-0">
								<Col sm="3">
									<InputGroup.Text style={{backgroundColor:"#c5c7c1"}} id="basic-addon1">Choose file for name_roll.csv</InputGroup.Text>
								</Col>
								<Col sm="9">
								<Stack direction='horizontal' gap={0}>
									<Form.Control name='name_roll' onChange={this.onFileChange} type="file" />
								</Stack>
								</Col>
							</InputGroup>
						
							<InputGroup className="mb-0">
								<Col sm="3">
									<InputGroup.Text style={{backgroundColor:"#c5c7c1"}} id="basic-addon1">Choose file for subject_master.csv</InputGroup.Text>
								</Col>
								<Col sm="9">
								<Stack direction='horizontal' gap={0}>
									<Form.Control name='subject_master' onChange={this.onFileChange} type="file" />
								</Stack>
								</Col>
							</InputGroup>

							<InputGroup className="mb-0">
								<Col sm="3">
									<InputGroup.Text style={{backgroundColor:"#c5c7c1"}} id="basic-addon1">Assistant Registrar Signature</InputGroup.Text>
								</Col>
								<Col sm="9">
									<InputGroup className="mb-0">
										<InputGroup.Checkbox style={{border:"2px solid black"}} name="signature_check" onClick={this.onCheckChange}/>
										<FormControl type='file' name="signature" onChange={this.onFileChange1} disabled={this.state.isSignatureDisabled} />
									</InputGroup>
								</Col>
							</InputGroup>

							<InputGroup className="mb-0">
								<Col sm="3">
									<InputGroup.Text style={{backgroundColor:"#c5c7c1"}} id="basic-addon1">IITP Stamp</InputGroup.Text>
								</Col>
								<Col sm="9">
									<InputGroup className="mb-3">
										<InputGroup.Checkbox style={{border:"2px solid black"}} name="stamp_check" onClick={this.onCheckChange}/>
										<FormControl type='file' name='stamp' onChange={this.onFileChange1} disabled={this.state.isStampDisabled} />
									</InputGroup>
								</Col>
							</InputGroup>


							<Button variant={this.state.isUploadDisabled?'success':'primary'} disabled={this.state.isUploadDisabled} type="submit" onClick={this.onUpload} className="ms-auto" style={{width:'100%'}}>{uploadButton}</Button>
							<Stack direction="horizontal" gap={1}>
								<Button variant={this.state.isShowReportDisabled?'success':'primary'} disabled={this.state.isShowReportDisabled} type="submit" onClick={this.handleShow} className="ms-auto" style={{width:'100%'}}>Show Report</Button>
								<Button variant={this.state.isDownloadDisabled?'success':'primary'} disabled={this.state.isDownloadDisabled} type="submit" onClick={this.onClickDownload} className="ms-auto" style={{width:'100%'}}>{downloadButton}</Button>
							</Stack>
						</Stack>
						
						</Form>
        	</Container>   
            </>
        );
    }
}

export default Transcript;