let confirmation = null;
let phone = '';

export function stashPhoneAuth(nextConfirmation, nextPhone) {
  confirmation = nextConfirmation;
  phone = nextPhone || '';
}

export function peekPhoneAuth() {
  return { confirmation, phone };
}

export function clearPhoneAuth() {
  confirmation = null;
  phone = '';
}
