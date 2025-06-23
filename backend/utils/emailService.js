// Simulación de servicio de email
// En producción, usar servicios como SendGrid, Mailgun, etc.

export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Simular envío de email
    console.log(`📧 Email de recuperación enviado a: ${email}`);
    console.log(`🔗 Token de recuperación: ${resetToken}`);
    console.log(`🌐 Link de recuperación: http://localhost:5173/reset-password?token=${resetToken}`);
    
    // En producción, aquí iría la lógica real de envío de email
    // Ejemplo con SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: 'noreply@ecotrueque.com',
      subject: 'Recuperación de contraseña - EcoTrueque',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="http://localhost:5173/reset-password?token=${resetToken}">Restablecer contraseña</a>
        <p>Este enlace expira en 1 hora.</p>
      `
    };
    
    await sgMail.send(msg);
    */
    
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};