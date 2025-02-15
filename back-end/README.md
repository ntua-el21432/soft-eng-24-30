# Back-end

1. Εισαγωγή:
Το back-end της εφαρμογής διαχειρίζεται την επιχειρησιακή λογική, τη σύνδεση με τη βάση δεδομένων και την παροχή RESTful API endpoints.

2. Τεχνολογίες
Node.js + Express
MySQL

3. Δομή του Backend
Το back-end περιλαμβάνει:
/routes       --> API endpoints
/middleware   --> Middleware functions
/apiTesting   --> Functional tests, postman collection (json)

app.js               --> δομή και ρύθμιση του back-end
passes-sample.csv    --> ενδεικτικά passes 
passes40.csv         --> passes για την ομάδα μας 
tollstations2024.csv --> toll stations 

4. Εγκατάσταση και Εκτέλεση
npm install
node server.js για την εκκίνηση του server 

5. API Endpoints
addPasses         --> προσθήκη διελεύσεων στην ΒΔ 
chargesBy         --> εμφανίζει τον αριθμό και το κόστος των διελεύσεων για συγκεκριμένο σταθμό 
healthcheck       --> επιβεβαιώνει τη συνδεσιμότητα
login             --> σύνδεση με credentials 
logout            --> αποσύνδεση του χρήστη
mapStations       --> διαδραστικός χάρτης με πινέζες διοδίων στις οποίες εμφανίζονται πληροφορίες για τον σταθμό
netCharges        --> συμψηφισμός χρεών μεταξύ δύο operators 
operators         --> εμφάνιση των παρόχων 
passAnalysis      --> εμφανίζει την ανάλυση των γεγονότων 
passesCost        --> εμφανίζει τον αριθμό και το κόστος των διελεύσεων 
resetPasses       --> διαγραφή των διελεύσεων 
resetStations     --> αρχικοποίηση του πίνακα σταθμών διοδίων με τις τιμές που περιέχονται στο αρχείο
station           --> εμφάνισει των σταθμών
tollStationPasses --> εμφανίζει τις διελεύσεις για τον σταθμό διοδίων 

6. Testing 
Για το testing χρησιμοποιούμε ένα δικό μας postman collection το οποίο εξετάζει τις απαραίτητες κλήσεις get & post, είναι εμπλουτισμένο με όλες τις περιπτώσεις και status codes καθώς επίσης και πληθώρα από tests τα οποία τρέχουν κατά την εκτέλεση της κλήσης.