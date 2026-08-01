import 'dart:io';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:image_picker/image_picker.dart';
import 'api_service.dart';
import 'login_screen.dart';

class DriverHome extends StatefulWidget {
  final Map<String, dynamic> user;

  DriverHome({required this.user});

  @override
  _DriverHomeState createState() => _DriverHomeState();
}

class _DriverHomeState extends State<DriverHome> {
  List<dynamic> _orders = [];
  bool _isLoading = true;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    try {
      final orders = await ApiService.getAllOrders();
      // Filtrar pedidos relevantes para el conductor
      setState(() {
        _orders = orders.where((order) {
          final status = (order['status'] ?? '').toString().toUpperCase().replaceAll(' ', '_');
          final isMyOrder = order['driverId'] == widget.user['id'];
          final isPending = status == 'PENDIENTE';
          final isMyActive = isMyOrder && (status == 'ASIGNADO' || status == 'EN_CAMINO');
          return isPending || isMyActive;
        }).toList();
      });
    } catch (e) {
      _showSnackBar('Error al cargar pedidos');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message, {bool success = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: success ? Colors.green : Color(0xFFD71920),
      ),
    );
  }

  // Abrir Google Maps con la ruta
  Future<void> _openGoogleMaps(Map<String, dynamic> order) async {
    final originLat = order['originLat'];
    final originLng = order['originLng'];
    final destLat = order['destLat'];
    final destLng = order['destLng'];

    // URL para Google Maps con ruta
    final url = 'https://www.google.com/maps/dir/?api=1'
        '&origin=$originLat,$originLng'
        '&destination=$destLat,$destLng'
        '&travelmode=driving';

    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      _showSnackBar('No se pudo abrir Google Maps');
    }
  }

  // Aceptar pedido
  Future<void> _acceptOrder(Map<String, dynamic> order) async {
    try {
      await ApiService.updateOrderStatus(
        order['id'],
        'ASIGNADO',
        driverId: widget.user['id'],
        driverName: widget.user['name'],
      );
      _showSnackBar('¡Pedido aceptado!', success: true);
      _loadOrders();
    } catch (e) {
      _showSnackBar('Error al aceptar pedido');
    }
  }

  // Iniciar ruta (marcar EN_CAMINO)
  Future<void> _startRoute(Map<String, dynamic> order) async {
    try {
      await ApiService.updateOrderStatus(order['id'], 'EN_CAMINO');
      _showSnackBar('¡Ruta iniciada!', success: true);
      _loadOrders();
      // Abrir Google Maps
      _openGoogleMaps(order);
    } catch (e) {
      _showSnackBar('Error al iniciar ruta');
    }
  }

  // Tomar foto y entregar
  Future<void> _deliverOrder(Map<String, dynamic> order) async {
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 70,
    );

    if (photo == null) {
      _showSnackBar('Debes tomar una foto de entrega');
      return;
    }

    try {
      // Mostrar loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => Center(
          child: Container(
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(color: Color(0xFFD71920)),
                SizedBox(height: 16),
                Text('Subiendo foto...'),
              ],
            ),
          ),
        ),
      );

      await ApiService.uploadDeliveryPhoto(order['id'], File(photo.path));

      Navigator.of(context).pop(); // Cerrar loading
      _showSnackBar('¡Pedido entregado exitosamente!', success: true);
      _loadOrders();
    } catch (e) {
      Navigator.of(context).pop(); // Cerrar loading
      _showSnackBar('Error al entregar pedido');
    }
  }

  // Logout
  void _logout() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(
          'URBSEND',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Color(0xFFD71920),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadOrders,
          ),
          IconButton(
            icon: Icon(Icons.logout, color: Colors.white),
            onPressed: _logout,
          ),
        ],
      ),
      body: Column(
        children: [
          // Header con info del conductor
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Color(0xFFD71920),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.delivery_dining, color: Colors.white, size: 28),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hola, ${widget.user['name']}',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${widget.user['vehicleType']} • ${widget.user['vehiclePlate']}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'EN LÍNEA',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Título sección
          Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(Icons.list_alt, color: Color(0xFF2C3E50)),
                SizedBox(width: 8),
                Text(
                  'Pedidos Disponibles',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2C3E50),
                  ),
                ),
                Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Color(0xFFD71920).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${_orders.length}',
                    style: TextStyle(
                      color: Color(0xFFD71920),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Lista de pedidos
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: Color(0xFFD71920)))
                : _orders.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadOrders,
                        color: Color(0xFFD71920),
                        child: ListView.builder(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _orders.length,
                          itemBuilder: (context, index) {
                            return _buildOrderCard(_orders[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 80, color: Colors.grey[300]),
          SizedBox(height: 16),
          Text(
            'No hay pedidos disponibles',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[500],
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Tira hacia abajo para actualizar',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[400],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> order) {
    final status = (order['status'] ?? 'PENDIENTE').toString().toUpperCase().replaceAll(' ', '_');
    final isMyOrder = order['driverId'] == widget.user['id'];
    final isPending = status == 'PENDIENTE';
    final isAssigned = status == 'ASIGNADO' && isMyOrder;
    final isEnRoute = status == 'EN_CAMINO' && isMyOrder;

    Color statusColor;
    String statusText;
    IconData statusIcon;

    if (isPending) {
      statusColor = Colors.orange;
      statusText = 'DISPONIBLE';
      statusIcon = Icons.access_time;
    } else if (isAssigned) {
      statusColor = Colors.blue;
      statusText = 'ASIGNADO';
      statusIcon = Icons.assignment_ind;
    } else if (isEnRoute) {
      statusColor = Colors.purple;
      statusText = 'EN CAMINO';
      statusIcon = Icons.directions_bike;
    } else {
      statusColor = Colors.grey;
      statusText = status;
      statusIcon = Icons.help_outline;
    }

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header del pedido
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(color: statusColor, width: 4),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Precio y estado
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order['customerName'] ?? 'Cliente',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[500],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Row(
                          children: [
                            Text(
                              'S/ ${(order['price'] ?? 0).toStringAsFixed(2)}',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.green[700],
                              ),
                            ),
                            if (order['paymentMethod'] == 'Yape')
                              Container(
                                margin: EdgeInsets.only(left: 8),
                                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.purple[100],
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'YAPE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.purple[700],
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Icon(statusIcon, size: 14, color: statusColor),
                          SizedBox(width: 4),
                          Text(
                            statusText,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 16),

                // Direcciones
                _buildAddressRow(
                  icon: Icons.radio_button_checked,
                  iconColor: Colors.green,
                  label: 'RECOJO',
                  address: order['originAddress'] ?? '',
                ),
                Container(
                  margin: EdgeInsets.only(left: 11),
                  height: 20,
                  width: 2,
                  color: Colors.grey[300],
                ),
                _buildAddressRow(
                  icon: Icons.location_on,
                  iconColor: Colors.red,
                  label: 'ENTREGA',
                  address: order['destAddress'] ?? '',
                ),
              ],
            ),
          ),

          // Botones de acción
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                // Botón Ver Mapa
                Expanded(
                  child: _buildActionButton(
                    icon: Icons.map_outlined,
                    label: 'Mapa',
                    color: Color(0xFF2C3E50),
                    onTap: () => _openGoogleMaps(order),
                  ),
                ),
                SizedBox(width: 8),

                // Botón principal según estado
                if (isPending)
                  Expanded(
                    flex: 2,
                    child: _buildActionButton(
                      icon: Icons.check_circle_outline,
                      label: 'Aceptar',
                      color: Color(0xFFD71920),
                      onTap: () => _acceptOrder(order),
                    ),
                  ),

                if (isAssigned)
                  Expanded(
                    flex: 2,
                    child: _buildActionButton(
                      icon: Icons.play_arrow,
                      label: 'Iniciar Ruta',
                      color: Colors.blue,
                      onTap: () => _startRoute(order),
                    ),
                  ),

                if (isEnRoute)
                  Expanded(
                    flex: 2,
                    child: _buildActionButton(
                      icon: Icons.camera_alt,
                      label: 'Entregar',
                      color: Colors.green,
                      onTap: () => _deliverOrder(order),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String address,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 22, color: iconColor),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[500],
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              Text(
                address,
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF2C3E50),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: color,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 20),
              SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
