import { getAuth } from 'firebase-admin/auth';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized: No token provided or incorrect format.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).send({ error: 'Unauthorized: Token expired.' });
    }
    return res.status(403).send({ error: 'Forbidden: Invalid token.' });
  }
};

export default authMiddleware;
