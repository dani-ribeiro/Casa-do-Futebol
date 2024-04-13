import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/NavBarTOP.css';
// Bootstrap Components -------------------------------------------------------
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
// ----------------------------------------------------------------------------

function NavBarTOP({ setCurrentView, loggedIn, setLoggedIn, showChangeModal, setShowChangeModal }) {

    const navigatePage = (page) => {
        setCurrentView( {page, data: null});
    };

    function signOut(){
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('points');
        setLoggedIn( { status: false, username: '', points: 0 });
    }

    return (
        <Container fluid className='navBar'>
            <Navbar className="bg-body-tertiary navBar">
                <Container fluid>
                    <div className='navBrand'>
                        <img src='/images/field.png' alt='Casa do Futebol' className='logo'></img>
                        <Navbar.Brand className='siteBrand' onClick={() => navigatePage('League Standings')}>Casa do Futebol</Navbar.Brand>
                    </div>
                    <Nav className="navRight">
                        <Nav.Link>Leaderboard</Nav.Link>
                            {
                                loggedIn.status ? (
                                    <>
                                    <NavDropdown title={loggedIn.username} className="basic-nav-dropdown">
                                        <NavDropdown.Item onClick={() => setShowChangeModal(true)}>Change Username</NavDropdown.Item>
                                        <NavDropdown.Item onClick={() => signOut()}>Sign Out</NavDropdown.Item>
                                    </NavDropdown>
                                    <img src='/images/default-user.svg'alt='User' className='profilePicture'></img>
                                    </>
                                ) :
                                (
                                    <>
                                    <NavDropdown 
                                        title={<img src='/images/default-user.svg'alt='User' className='profilePicture'></img>} 
                                        className="basic-nav-dropdown"
                                    >
                                        <NavDropdown.Item onClick={() => navigatePage('Sign Up')}>Sign Up</NavDropdown.Item>
                                        <NavDropdown.Item onClick={() => navigatePage('Log In')}>Sign In</NavDropdown.Item>
                                    </NavDropdown>
                                    </>
                                )
                            }
                    </Nav>
                </Container>
            </Navbar>
        </Container>
    );
  }


export default NavBarTOP;