Universal Links (iOS)
============================
Es un sistema de archivos y programas que permite que un mobil iOS abra una app determinada con una URL que pertenece al sitio web de esa app.

### Support Universal Links

1. Enable UL entre la app y el sitio web. Pasos: [Enabling Universal Links](https://developer.apple.com/documentation/uikit/inter-process_communication/allowing_apps_and_websites_to_link_to_your_content/enabling_universal_links)
2. Promover el delegado de iOS que responde a la actividad del usuario par que reaccione a la apertura de la app cuando se dirige a un link del website. Pasos: [Handling Universal Links](https://developer.apple.com/documentation/uikit/inter-process_communication/allowing_apps_and_websites_to_link_to_your_content/handling_universal_links)

Cuando se instala una app, iOS busca **un archivo** en el web server que verifica que el sitio puede abrir URLs en nombre del sistema operativo. 

### Enable Universal Links 

1. Asociated Domains Entitlement [_Sitio_](https://developer.apple.com/documentation/security/password_autofill/setting_up_an_app_s_associated_domains#3001207)

.. Dominios asociados a servicios especificos (como UL). Para permitir a la app el uso de UL, abrir el tab de Capabilities y habilitar Asociated Domains. Cambiar el prefijo de webcredentials por applinks. Para matchear con mas de un subdominio, usar wildcard *. 

2. Crear el Apple App Site Asociation File 

.. Crear un archivo _apple-app-site-association_ (sin extension). Colocar un JSON en el archivo: 

```
{
    "applinks": {
        "apps": [],
        "details": [{
            "appID": "<id-equipo>.com.mantotech.accsmartcontrol",
            "paths": ["/register/*"]
            }]
    }
}
```

formato: <Team Identifier>.<Bundle Identifier>

Hay que colcar este archivo en el directorio raiz del servidor, o en un directorio _.well-known_

Ejemplo: https://<fully qualified domain>/.well-known/apple-app-site-association

3. Validar la Asociation File

Cuando se instala la app en un mobil iOS, este intentara descargar y validar el archivo de asociacion especificado en el Entitlement. A cada dominio encontrado, se le agrega la extension _/apple-app-site-association_ o _/.well-known/apple-app-site-association_ 

### Handle Universal Links

Update your app delegate to respond when it receives an __NSUserActivity__ object with the __activityType__ set to __NSUserActivityTypeBrowsingWeb__.

App Links (Android)
==========

Sitio: [Handling Android App Links](https://developer.android.com/training/app-links/index.html#web-assoc)

1. Create deep links to specific content in your app. 

* Add intent filter for incoming links
.. Hay que acceder al manifest de android y hacer un intent filter con los atributos <action> <data> y <category>

ejemplo: 

```
<activity
    android:name="com.mantotech.accsmartcontrol"
    android:label="@string/accsmartcontrol" >
    <intent-filter android:autoVerify="true" android:label="@string/filter_view_http_register">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <!-- Accepts URIs that begin with "http://www.accsmartlink.com/register” -->
        <data android:scheme="http"
              android:host="www.accsmartlink.com"
              android:pathPrefix="/register" />
        <!-- note that the leading "/" is required for pathPrefix-->
    </intent-filter>
</activity>
```

* Read data from incoming intents (solo para AS as que no lo voy a poner)




2. Add verification for your deep links


* Agregar la verificacion automatica en el manifesto. De esta manera se le notifica al SO que debe verificar que la app pertenezca a los dominios declarados en los intent filters

* Request app link verification: agregar la sentencia android:autoVerify="true" en la declaracion del intent filter. (ya esta agregado). CUando se agrega esta sentencia, ocurre que cuando se instala la app, el sistema operativo va a verificar los hosts declarados en los intent filters (parecido a lo que ocurre en iOS). La verificacion es la siguiente: 

1. Se inspeccionan todos los filtros que incluyen: 

Action: android.intent.action.VIEW
Categories: android.intent.category.BROWSABLE and android.intent.category.DEFAULT
Data scheme: http or https

2. Por cada sitio en los intent filters, Android va a buscar en ellos el archivo Digital Asset Links en la direccion https://www.accsmartlink.com/.well-known/assetlinks.json


El archivo Digital Asset Links es un archivo JSON que declara la relacion entre el sitio web y los intent filters. 

Tiene los siguientes campos: 

- package_name: The application ID
- sha256_cert_fingerprints: The SHA256 fingerprints of your app’s signing certificate.

$ keytool -list -v -keystore my-release-key.keystore ## comando para java pero nosotros tenemos phonegap

Ejemplo: 
```
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.mantotech.accsmartcontrol",
    "sha256_cert_fingerprints":
  }
}]
```

[Testing App Links](https://developer.android.com/training/app-links/verify-site-associations.html#testing)



## Phonegap

#### Las secciones anteriores estan pensadas para aplicar en android studio y xcode, por eso ahora vemos como hacer todo esto en Phonegap. 

phoengap plugin add cordova-plugin-deeplinks (en teoria sirve para ios y android)

```
<universal-links>
    <host name="accsmartlink.com" scheme="https" event="link_event">
        <path url="/app/register" />
    </host>
</universal-links>
```

En el punto que se reconoce esto, iOS va a intentar acceder al apple-app-site-asociation file en el servidor. Va a buscar el archivo en https://users.example.com/apple-app-site-association y en https://example.com/apple-app-site-association respectivamente.

Para Android, intenta acceder a https://*.users.example.com/.well-known/assetlinks.json y a https://*.example.com/.well-known/assetlinks.json respectivamente.

