import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/changeUsernameModal.css';
// Bootstrap Components -------------------------------------------------------
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';



function ShowChangeModal( { showChangeModal, setShowChangeModal, loggedIn, setLoggedIn } ){
    const [editUsernameWarning, setEditUsernameWarning] = useState('');

    const handleClose = () => setShowChangeModal(false);

    // edits username
    function editUsername(event){
        const username = document.getElementById("editUsername-field").value;
        const currentUsername = loggedIn.username;

        event.preventDefault();
    
        fetch("/backend/editUsername", {
                method: 'PUT',
                body: JSON.stringify({ currentUsername, username }),
                headers: {'content-type': 'application/json'}
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("Unsuccessful username change.");
                }else{
                    return response.json();
                }
            })
            .then(data => {
                if(data.success){
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('username', username);
                    setLoggedIn( { status: true, username: data.username });
                    handleClose();
                }else if(data.error === 'Username Exists'){     // if username already exists --> return warning message and allow user to try again
                    setEditUsernameWarning(`Username ${data.username} already exists. Please try again.`);
                }else if(data.error === 'Invalid'){
                    setEditUsernameWarning('Invalid Username or Password. Please try again.');
                }else{  // DB connection failed
                    handleClose();
                }
            })
            .catch(err => console.error(err));
        return false;
    }

    return (
        <Modal show={showChangeModal} onHide={handleClose} animation={'fade'} centered>
            <Modal.Header id='editUsername-modal'>
                {/* <!-- warning --> */}
                {editUsernameWarning && (
                    <div id="warning-edit" className='warning'>
                        <h3>{editUsernameWarning}</h3>
                    </div>
                )}
            <Modal.Title>Avatar</Modal.Title>
                <img src='/images/default-user.svg' id='avatarImage' alt='Avatar'></img>
                <DropdownButton
                    key={'down-centered'}
                    className={'dropdown-button-drop-down-centered'}
                    id='editUsername-dropdown'
                    drop={'down-centered'}
                    variant="btn"
                    title={
                        <div>
                            <span id='editUsername-username'>{loggedIn.username}</span>
                            <img src="/images/edit.svg" alt="Edit Username" className="edit-icon" />
                        </div>
                    }
                >
                    <Form id="editUsername" onSubmit={editUsername}>
                        <Form.Group className="input-group">
                            <Form.Label>New Name</Form.Label>
                            <Form.Control type="text" id="editUsername-field" placeholder="Username"/>
                            <Button id="editUsername-submit" variant="secondary">Change</Button>
                        </Form.Group>
                    </Form>
                </DropdownButton>
            </Modal.Header>
      </Modal>
    );
}

export default ShowChangeModal;