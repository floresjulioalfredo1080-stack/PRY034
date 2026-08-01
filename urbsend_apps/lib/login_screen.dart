import 'package:flutter/material.dart';
import 'api_service.dart';
import 'client_home.dart';
import 'driver_home.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passController = TextEditingController();
  bool _isLoading = false;
  bool _isDriver = false; // Toggle entre Cliente y Conductor

  void _login() async {
    if (_emailController.text.isEmpty || _passController.text.isEmpty) {
      _showSnackBar('Ingresa email y contraseña');
      return;
    }

    setState(() => _isLoading = true);
    try {
      Map<String, dynamic> response;

      if (_isDriver) {
        // Login Conductor
        response = await ApiService.loginDriver(
          _emailController.text,
          _passController.text,
        );
        final user = response['user'];
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => DriverHome(user: user)),
        );
      } else {
        // Login Cliente
        response = await ApiService.loginClient(
          _emailController.text,
          _passController.text,
        );
        final user = response['user'];
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => ClientHome(user: user)),
        );
      }
    } catch (e) {
      _showSnackBar(e.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Color(0xFFD71920),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(height: 60),

              // Logo
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Color(0xFFFFF0F0),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isDriver ? Icons.delivery_dining : Icons.local_shipping,
                  size: 60,
                  color: Color(0xFFD71920),
                ),
              ),
              SizedBox(height: 20),

              // Título
              Text(
                "URBSEND",
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C3E50),
                ),
              ),
              Text(
                _isDriver ? "App Repartidor" : "App Cliente",
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
              SizedBox(height: 40),

              // Toggle Cliente/Conductor
              Container(
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isDriver = false),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: !_isDriver ? Color(0xFFD71920) : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.person,
                                color: !_isDriver ? Colors.white : Colors.grey[600],
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Text(
                                "Cliente",
                                style: TextStyle(
                                  color: !_isDriver ? Colors.white : Colors.grey[600],
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isDriver = true),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: _isDriver ? Color(0xFFD71920) : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.delivery_dining,
                                color: _isDriver ? Colors.white : Colors.grey[600],
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Text(
                                "Repartidor",
                                style: TextStyle(
                                  color: _isDriver ? Colors.white : Colors.grey[600],
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 30),

              // Email
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: "Email",
                  hintText: _isDriver ? "conductor@urbsend.com" : "cliente@email.com",
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: Icon(Icons.email_outlined),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Color(0xFFD71920), width: 2),
                  ),
                ),
              ),
              SizedBox(height: 16),

              // Contraseña
              TextField(
                controller: _passController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: "Contraseña",
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: Icon(Icons.lock_outline),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Color(0xFFD71920), width: 2),
                  ),
                ),
              ),
              SizedBox(height: 30),

              // Botón Login
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFD71920),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                  onPressed: _isLoading ? null : _login,
                  child: _isLoading
                      ? SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          "INGRESAR",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),

              SizedBox(height: 20),

              // Info
              if (_isDriver)
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.blue[200]!),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.blue[700]),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          "Usa tus credenciales de conductor registrado en URBSEND",
                          style: TextStyle(
                            color: Colors.blue[700],
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              SizedBox(height: 40),

              // Footer
              Text(
                "URBSEND v1.0",
                style: TextStyle(
                  color: Colors.grey[400],
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
