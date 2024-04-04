import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/NavBarTOP.css';
// Bootstrap Components -------------------------------------------------------
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
// ----------------------------------------------------------------------------

function NavBarTOP({ setCurrentView }) {

    const navigatePage = (page) => {
        setCurrentView(page);
    };

    return (
        <Container fluid className='navBar'>
            <Navbar className="bg-body-tertiary navBar">
                <Container fluid>
                    <div className='navBrand'>
                        <img src='/images/field.png' alt='Casa do Futebol' className='logo'></img>
                        <Navbar.Brand className='siteBrand'>Casa do Futebol</Navbar.Brand>
                    </div>
                    <Nav className="navRight">
                        <Nav.Link>Leaderboard</Nav.Link>
                        <NavDropdown title="username" className="basic-nav-dropdown">
                            <NavDropdown.Item onClick={() => navigatePage('Sign Up')}>Sign Up</NavDropdown.Item>
                            <NavDropdown.Item>Sign In</NavDropdown.Item>
                            <NavDropdown.Item>Change Username</NavDropdown.Item>
                        </NavDropdown>
                        <img src='/images/default-user.svg' alt='User' className='profilePicture'></img>
                    </Nav>
                </Container>
            </Navbar>
        </Container>
    );
  }


export default NavBarTOP;