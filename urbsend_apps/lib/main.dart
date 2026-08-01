import 'package:flutter/material.dart';
import 'login_screen.dart';

void main() {
  runApp(UrbsendApp());
}

class UrbsendApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Urbsend',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: Color(0xFFD71920),
        useMaterial3: true,
      ),
      home: LoginScreen(),
    );
  }
}