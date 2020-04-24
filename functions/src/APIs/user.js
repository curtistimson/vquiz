import firebase from 'firebase';
import { db } from '../util/admin';
import { validateLoginData, validateSignUpData } from '../util/validators';

export function loginUser(req, res) {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  return firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => data.user.getIdToken())
    .then((token) => res.json({ token }))
    .catch((err) => {
      console.error(err); // eslint-disable-line no-console
      return res.status(403).json({ info: 'Incorrect credentials' });
    });
}

export function signUpUser(req, res) {
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  const { valid, errors } = validateSignUpData(newUser);

  if (!valid) return res.status(400).json(errors);

  let token;
  let userId;

  return db
    .doc(`/user/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ username: 'this username is already taken' });
      }
      return firebase
        .auth()
        .createUserWithEmailAndPassword(
          newUser.email,
          newUser.password,
        );
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idtoken) => {
      token = idtoken;
      const userCredentials = {
        username: newUser.username,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db
        .doc(`/user/${newUser.username}`)
        .set(userCredentials);
    })
    .then(() => res.status(201).json({ token }))
    .catch((err) => {
      console.error(err); // eslint-disable-line no-console
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email already in use' });
      }
      return res.status(500).json({ general: 'Something went wrong, please try again' });
    });
}
