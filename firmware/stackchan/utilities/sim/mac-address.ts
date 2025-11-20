import Net from 'net'

function getMacAddress(): string {
  return Net.get('MAC')
}
export default getMacAddress
