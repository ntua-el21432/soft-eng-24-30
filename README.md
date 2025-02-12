# SoftEng-templates

Template repository, used for NTUA/ECE Software Engineering, 2024-2025

Η εφαρμογή της ομάδα μας softeng24-30, ονόμαζεται Toll Manager.

Ύστερα από git clone, και την δημιουργία της βάσης δεδομένων σύμφωνα με το αρχείο back-end/database.sql πρέπει να προστεθεί ενα αρχείο .env στο φάκελο back-end, με τα στοιχεία συνδεσης στη βάση:
πχ.
DB_HOST=localhost
DB_USER=root
DB_PASS= 
DB_NAME=tollmanager
PORT=9115

Και στο φάκελο front-end πρεπει να προστεθεί το αρχείο next-env.d.ts με τα εξης περιεχόμενα:
/// <reference types="next" />
/// <reference types="next/image-types/global" />

Μπορούμε πλεον να ξεκινησουμε τη εκτέλεση της εφαρμογής:
1) Τρέχουμε στο terminal στο φάκελο back-end την εντολή node server.js και ξεκιναει ο server
2) Αφου λάβοουμε το μηνυμα server running on port 9115 μπορουμε να εκτελεσουμε πλεον τα διάφορα api endpoints που υπάρχουν στο app.js
3) Σε ενα καινουργιο terminal μπορουμε να τρέξουμε και το περιβαλλον cli. Για να δειτε τις διαθεσιμες εντολές πληκτρολογήστε se2430 --help
4) Πηγαινοντας στο εξης path /front-end/toll_manager/app και εκτελώντας τη εντολή npm run dev, μπορείτε να ξεκινήσε το localhost και να δείτε το UI της εφαρμογής
5) Επισκεφτείτε την σελιδα http://localhost:3000/ εκεί πέρα οι καθημερινοί χρήστες μπορουν να δουν τη διεπαφή του χάρτη απο το κουμπι View Map, ενώ με login μπορούν όσοι υπαλληλοι εταιρειων έχουν λογαριαμούς να συνδεθουν και να εκτελεσουν διαφορα operations που τους ενδιαφέρουν 
