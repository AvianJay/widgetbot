import * as React from 'react'
import styled from '@emotion/styled'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: #36393f;
  color: #dcddde;
  font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #fff;
`

const Description = styled.p`
  font-size: 16px;
  margin-bottom: 30px;
  color: #b9bbbe;
  text-align: center;
  max-width: 500px;
  line-height: 1.5;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
`

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  background: #40444b;
  border: 1px solid #202225;
  border-radius: 4px;
  color: #dcddde;
  margin-bottom: 16px;
  font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;

  &:focus {
    outline: none;
    border-color: #7289da;
  }

  &::placeholder {
    color: #72767d;
  }
`

const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  background: #7289da;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #677bc4;
  }

  &:active {
    background: #5b6eae;
  }

  &:disabled {
    background: #4e5d94;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: #f04747;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
`

interface Props {
  onAuthenticate: (userId: string) => void
}

interface State {
  userId: string
  error: string
  isLoading: boolean
}

export default class AdminAuth extends React.Component<Props, State> {
  state = {
    userId: '',
    error: '',
    isLoading: false
  }

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { userId } = this.state
    
    if (!userId.trim()) {
      this.setState({ error: 'Please enter your Discord User ID' })
      return
    }

    this.setState({ isLoading: true, error: '' })

    try {
      // Store the user ID in localStorage for future sessions
      localStorage.setItem('adminUserId', userId)
      
      // Call the authentication callback
      this.props.onAuthenticate(userId)
    } catch (error) {
      this.setState({
        error: 'Authentication failed. Please check your User ID and try again.',
        isLoading: false
      })
    }
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ userId: e.target.value, error: '' })
  }

  componentDidMount() {
    // Check if user ID is already stored
    const storedUserId = localStorage.getItem('adminUserId')
    if (storedUserId) {
      this.props.onAuthenticate(storedUserId)
    }
  }

  render() {
    const { userId, error, isLoading } = this.state

    return (
      <Container>
        <Title>Message Logger - Admin Access Required</Title>
        <Description>
          This is a read-only message logger. Only administrators can access message history.
          Please enter your Discord User ID to continue.
        </Description>
        <Form onSubmit={this.handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Input
            type="text"
            placeholder="Discord User ID (e.g., 123456789012345678)"
            value={userId}
            onChange={this.handleChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Authenticate'}
          </Button>
        </Form>
      </Container>
    )
  }
}
