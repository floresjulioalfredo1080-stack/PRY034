import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

class ApiService {
  // CAMBIA ESTO: Usa '10.0.2.2:3001' para Emulador o tu IP '192.168.x.x:3001' para celular real
  static const String baseUrl = 'http://10.0.2.2:3001/api';

  // ============ CLIENTE ============

  // Login de Cliente
  static Future<Map<String, dynamic>> loginClient(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login/client'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": email,
        "password": password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Error de login');
    }
  }

  // Crear Pedido
  static Future<Map<String, dynamic>> createOrder(Map<String, dynamic> orderData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(orderData),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al crear pedido: ${response.body}');
    }
  }

  // Obtener Historial de Cliente
  static Future<List<dynamic>> getMyOrders(String userId) async {
    final response = await http.get(Uri.parse('$baseUrl/users/$userId/orders'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return [];
    }
  }

  // ============ CONDUCTOR ============

  // Login de Conductor
  static Future<Map<String, dynamic>> loginDriver(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login/driver'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": email,
        "password": password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Error de login');
    }
  }

  // Obtener todos los pedidos (para el conductor)
  static Future<List<dynamic>> getAllOrders() async {
    final response = await http.get(Uri.parse('$baseUrl/orders'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return [];
    }
  }

  // Actualizar estado del pedido
  static Future<Map<String, dynamic>> updateOrderStatus(
    String orderId,
    String status,
    {String? driverId, String? driverName}
  ) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/orders/$orderId/status'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "status": status,
        if (driverId != null) "driverId": driverId,
        if (driverName != null) "driverName": driverName,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al actualizar estado');
    }
  }

  // Subir foto de entrega y marcar como entregado
  static Future<Map<String, dynamic>> uploadDeliveryPhoto(
    String orderId,
    File imageFile,
  ) async {
    var request = http.MultipartRequest(
      'PATCH',
      Uri.parse('$baseUrl/orders/$orderId/status'),
    );

    request.fields['status'] = 'ENTREGADO';

    // Agregar la imagen
    var stream = http.ByteStream(imageFile.openRead());
    var length = await imageFile.length();

    var multipartFile = http.MultipartFile(
      'evidence',
      stream,
      length,
      filename: 'evidence_${DateTime.now().millisecondsSinceEpoch}.jpg',
      contentType: MediaType('image', 'jpeg'),
    );

    request.files.add(multipartFile);

    var response = await request.send();
    var responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      return jsonDecode(responseBody);
    } else {
      throw Exception('Error al subir foto de entrega');
    }
  }

  // Obtener pedido por ID
  static Future<Map<String, dynamic>?> getOrderById(String orderId) async {
    final response = await http.get(Uri.parse('$baseUrl/orders/$orderId'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return null;
    }
  }
}
