import 'package:flutter/material.dart';
import 'api_service.dart';

class ClientHome extends StatefulWidget {
  final Map<String, dynamic> user;

  ClientHome({required this.user});

  @override
  _ClientHomeState createState() => _ClientHomeState();
}

class _ClientHomeState extends State<ClientHome> {
  final _originController = TextEditingController();
  final _destController = TextEditingController();
  String _packageSize = 'mediano';
  bool _isLoading = false;

  void _createOrder() async {
    setState(() => _isLoading = true);

    // NOTA: Para MVP simplificado, enviamos coordenadas hardcodeadas o "0,0"
    // Si quieres geocoding real en Flutter, necesitas el paquete 'geolocator' y 'geocoding'
    // Para cumplir el "MVP 30 días" rápido, simularemos coords o el backend debe aceptar solo texto si lo modificas.
    // Aquí enviaré coordenadas dummy para que tu backend no falle (ya que espera floats).

    final orderData = {
      "userId": widget.user['id'],
      "customerName": widget.user['name'],
      "origin": {
        "address": _originController.text,
        "lat": -16.4090, // Demo: Plaza de Armas Arequipa
        "lng": -71.5374
      },
      "destination": {
        "address": _destController.text,
        "lat": -16.3988, // Demo: Yanahuara
        "lng": -71.5369
      },
      "packageSize": _packageSize,
      "urgency": false,
      "price": 10.00, // Precio fijo para MVP App, o calcula según lógica simple
      "paymentMethod": "Efectivo"
    };

    try {
      await ApiService.createOrder(orderData);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('¡Pedido Creado Exitosamente!')),
      );
      _originController.clear();
      _destController.clear();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Nuevo Envío"),
        backgroundColor: Color(0xFFD71920),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Hola, ${widget.user['name']}", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 20),
            TextField(
              controller: _originController,
              decoration: InputDecoration(labelText: "Dirección de Origen", prefixIcon: Icon(Icons.my_location)),
            ),
            SizedBox(height: 10),
            TextField(
              controller: _destController,
              decoration: InputDecoration(labelText: "Dirección de Destino", prefixIcon: Icon(Icons.location_on)),
            ),
            SizedBox(height: 20),
            Text("Tamaño del Paquete"),
            DropdownButton<String>(
              value: _packageSize,
              isExpanded: true,
              items: ['pequeño', 'mediano', 'grande'].map((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value.toUpperCase()),
                );
              }).toList(),
              onChanged: (val) => setState(() => _packageSize = val!),
            ),
            SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF2C3E50),
                    padding: EdgeInsets.symmetric(vertical: 16)),
                onPressed: _isLoading ? null : _createOrder,
                child: _isLoading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text("SOLICITAR ENVÍO (S/ 10.00)", style: TextStyle(color: Colors.white)),
              ),
            )
          ],
        ),
      ),
    );
  }
}