import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, Image, KeyboardAvoidingView, Alert } from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config"; //Aula 71: Importar o firebase para registro das transações
//Desafio 02: Importar o firebase
import firebase from "firebase";

//Aula 70: Adicionar as imagens (logotipo, fundo e nomeApp)
const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");


export default class TransactionScreen extends Component {
  //Aula 69: Definir os estados iniciais em nosso App:
  constructor(props){
    super(props);
    this.state = {
      //Aula 70: Add 2 novos estados: identificação do aluno e do livro
      bookId: "",
      studentId: "",
      domState: "normal", //Estado do modo: Modo Digitalizar ou Modo Digitalizado
      hasCameraPermissions: null, //Estado de permissões: Se o usuário deu ou não permissão 
      scanned: false, //Estado Digitalizado: Digitalização foi concluída ou não.
    };
  }

  //Aula 69: Criar a função para solicitar permissão para a câmera
  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" é true (verdadeiro) se o usuário concedeu permissão
        status === "granted" é false (falso) se o usuário não concedeu permissão
      */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    });
  };

  //Aula 69: Criar função para digitalização concluída
  //Aula 70: Após o scanner é necessário saber qual QRCode foi lido - Separar bookId e studentId
  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  //Aula 71 e 72: Função Gerenciar Transação: Quando o botão for pressionado queremos retirar ou devolver o livro do aluno
  handleTransaction = async() => {
    var { bookId, studentId } = this.state; //Obtem os dados de dentro do documento
    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    db.collection("books") //db.collection("nome da coleção").doc(id_documento).get -> vai agir assim que o doc for recebido
      .doc(bookId)
      .get()
      .then(doc => { //Com o documento recebido, chama-se then para ler os dados do doc
        //Separando as transações: SE O livro está disponível 
        var book = doc.data();
        if (book.is_book_available) { 
          var {bookName, studentName} = this.state;
          this.initiateBookIssue(bookId, studentId, bookName, studentName); //Função inicia a retirada do livro

          alert("Livro emprestado para o aluno");
        } else {
          //Desafio 03: Atualizar o número de livros entregue pelo aluno
          var {bookName, studentName} = this.state;
          this.initiateBookReturn(bookId, studentId, bookName, studentName); //Função inicia a devolução do livro

          alert("Livro devolvido para a biblioteca");
        }
      });
  }

  //Aula 72: Obter detalhes do livro
  getBookDetails = bookId => {
    bookId = bookId.trim();
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            bookName: doc.data().book_name
          });
        });
      });
  };

  //Aula 72: Obter detalhes do aluno
  getStudentDetails = studentId => {
    studentId = studentId.trim();
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            studentName: doc.data().student_name
          });
        });
      });
  };

  //Aula 72: Completar a função de emprestimo dos livros
  initiateBookIssue = (bookId, studentId, bookName, studentName) => {
     //adicionar uma transação
     db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue"
    });
    //alterar status do livro
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: false
      });
    // alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(1)
      });

    // atualizando estado local
    this.setState({
      bookId: "",
      studentId: ""
    });
  };

  //Desafio 01: Completar a função de devolução dos livros
  initiateBookReturn = (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    });
    //alterar status do livro
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: true
      });
    // alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(-1)
      });

    // atualizando estado local
    this.setState({
      bookId: "",
      studentId: ""
    });
  };

  render() {
    //Aula 69: Chamar os estados iniciais
    //Aula 70: Atualizar os estados iniciais
    const { bookId, studentId, domState, scanned } = this.state;
    
    //Aula 69: Condição para análise de "domState" para ação de scanear
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }

    /*Aula 70: Personalização da tela de Transação
    Inserção de Imagem de Fundo e imagens de ícones
    Inserção do formulário de entrada para receber o ID Livro e ID Aluno com um botão lateral de scanner
    //Aula 71: Botão de envio das informações inseridas chamando a função handleTransaction*/
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ImageBackground source={bgImage} style={styles.bgImage}>
        <View style={styles.upperContainer}>
          <Image source={appIcon} style={styles.appIcon} />
          <Image source={appName} style={styles.appName} />
        </View>
        <View style={styles.lowerContainer}>
          <View style={[styles.textinputContainer, { marginTop: 25 }]}>
            <TextInput
              style={styles.textinput}
              placeholder={"ID do Livro"}
              placeholderTextColor={"#FFFFFF"}
              value={bookId}
              onChangeText= {text => this.setState({bookId: text})}
            />
            <TouchableOpacity
              style={styles.scanbutton}
              onPress={() => this.getCameraPermissions("bookId")}
            >
              <Text style={styles.scanbuttonText}>Digitalizar</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.textinputContainer, { marginTop: 10 }]}>
              <TextInput
                style={styles.textinput}
                placeholder={"ID do Estudante"}
                placeholderTextColor={"#FFFFFF"}
                value={studentId}
                onChangeText= {text => this.setState({studentId: text})}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, {marginTop: 25}]}
              onPress={this.handleTransaction}
            >
              <Text style={styles.buttonText}> ENVIAR </Text>
            </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 180,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 20,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15
  },
  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Rajdhani_600SemiBold"
  }
});